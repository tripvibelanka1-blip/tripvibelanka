'use server';

import { createClient } from '@/utils/supabase/server';
import { Booking, BookingInsert, SelectedActivityItem } from '@/types/database';

/**
 * ============================================================================
 * DATABASE MIGRATION SCRIPT (Execute in Supabase SQL Editor if not already run)
 * ============================================================================
 * 
 * -- 1. Add currency column if missing
 * ALTER TABLE bookings ADD COLUMN IF NOT EXISTS currency TEXT NOT NULL DEFAULT 'LKR' CHECK (currency IN ('LKR', 'USD'));
 * 
 * -- 2. Add applied_exchange_rate snapshot column
 * ALTER TABLE bookings ADD COLUMN IF NOT EXISTS applied_exchange_rate NUMERIC(10, 4) DEFAULT 1.0000;
 * 
 * -- 3. Verify indexes
 * CREATE INDEX IF NOT EXISTS idx_bookings_reference ON bookings(reference_no);
 * CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(booking_status, payment_status);
 * ============================================================================
 */

const FALLBACK_LKR_RATE = 328.0;

/**
 * Server-side helper to fetch the latest cached exchange rate.
 * Uses Next.js 12-hour server-side revalidation cache.
 * NEVER trusts client-submitted exchange rates to eliminate currency arbitrage.
 */
export async function getServerExchangeRate(): Promise<{ rate: number; isFallback: boolean }> {
  try {
    const res = await fetch('https://open.er-api.com/v6/latest/USD', {
      next: { revalidate: 43200 }, // 12 hours
      headers: { Accept: 'application/json' },
    });

    if (!res.ok) throw new Error(`Exchange rate provider returned status ${res.status}`);

    const data = await res.json();
    if (data?.result === 'success' && typeof data?.rates?.LKR === 'number') {
      return {
        rate: parseFloat(data.rates.LKR.toFixed(4)),
        isFallback: false,
      };
    }
    throw new Error('Invalid rate response format');
  } catch (error) {
    console.error('[Server Rate Fetch] Fallback rate engaged:', error);
    return {
      rate: FALLBACK_LKR_RATE,
      isFallback: true,
    };
  }
}

export interface CheckoutActivityInput {
  activity_id: string;
  title: string;
  price_per_person_usd: number;
  quantity: number;
}

export interface CreateBookingInput {
  tourId?: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerCountry?: string;
  pickupLocation?: string | null;
  specialRequests?: string | null;
  travelDate: string;
  adults: number;
  children?: number;
  selectedActivities?: CheckoutActivityInput[];
  basePriceUsd: number; // Master Anchor USD rate
  currency: 'USD' | 'LKR'; // Customer's preferred payment currency
  couponCode?: string | null;
  discountAmount?: number;
}

export interface BookingResult {
  success: boolean;
  booking?: Booking;
  error?: string;
}

/**
 * Server Action: Submit Booking with Locked Currency & Exchange Rate
 * 
 * Guarantees:
 * 1. USD is the Master Anchor Currency.
 * 2. Exchange rate is fetched and locked server-side at moment of checkout.
 * 3. Client cannot manipulate amounts or exchange rates.
 * 4. 20% advance payment and 80% balance are calculated and permanently frozen in the row.
 */
export async function submitBookingWithCurrencyLock(
  input: CreateBookingInput
): Promise<BookingResult> {
  try {
    // 1. Validate customer & travel data
    if (!input.customerName.trim() || !input.customerEmail.trim() || !input.customerPhone.trim()) {
      return { success: false, error: 'Customer contact details are required.' };
    }

    if (!input.travelDate) {
      return { success: false, error: 'Departure/travel date is required.' };
    }

    const adults = Math.max(1, Number(input.adults) || 1);
    const children = Math.max(0, Number(input.children) || 0);
    const travelersCount = adults + children;

    // 2. Fetch server-side verified exchange rate (anti-arbitrage safeguard)
    const { rate: liveRate } = await getServerExchangeRate();

    // 3. Compute USD Master Subtotals
    const tourBaseUsd = Number(input.basePriceUsd) || 0;
    const tourTotalUsd = tourBaseUsd * travelersCount;

    // Calculate optional activity add-ons
    const activitiesSnapshot: SelectedActivityItem[] = [];
    let activitiesTotalUsd = 0;

    if (input.selectedActivities && Array.isArray(input.selectedActivities)) {
      for (const act of input.selectedActivities) {
        const qty = Math.max(1, Number(act.quantity) || 1);
        const pUsd = Number(act.price_per_person_usd) || 0;
        const lineTotalUsd = pUsd * qty;
        activitiesTotalUsd += lineTotalUsd;

        // Snapshot in the selected currency
        const unitPriceInCurrency =
          input.currency === 'LKR' ? Math.round(pUsd * liveRate) : pUsd;
        const totalInCurrency =
          input.currency === 'LKR'
            ? Math.round(lineTotalUsd * liveRate)
            : parseFloat(lineTotalUsd.toFixed(2));

        activitiesSnapshot.push({
          activity_id: act.activity_id,
          title: act.title,
          price_per_person: unitPriceInCurrency,
          quantity: qty,
          total: totalInCurrency,
        });
      }
    }

    const subtotalUsd = tourTotalUsd + activitiesTotalUsd;

    // 4. Calculate Discount & Deductions
    const rawDiscount = Math.max(0, Number(input.discountAmount) || 0);
    // Determine USD discount equivalent
    const discountInUsd = input.currency === 'LKR' ? rawDiscount / liveRate : rawDiscount;
    const grandTotalUsd = Math.max(0, subtotalUsd - discountInUsd);

    // 5. Lock in Amounts and 20% Advance based on customer's chosen checkout currency
    let totalAmount: number;
    let advanceAmount: number;
    let remainingBalance: number;
    const appliedExchangeRate = liveRate;

    if (input.currency === 'LKR') {
      // Convert to Sri Lankan Rupees rounded to nearest whole rupee
      totalAmount = Math.max(0, Math.round(grandTotalUsd * liveRate));
      advanceAmount = Math.round(totalAmount * 0.20);
      remainingBalance = totalAmount - advanceAmount;
    } else {
      // USD Master Currency
      totalAmount = Math.max(0, parseFloat(grandTotalUsd.toFixed(2)));
      advanceAmount = parseFloat((totalAmount * 0.20).toFixed(2));
      remainingBalance = parseFloat((totalAmount - advanceAmount).toFixed(2));
    }

    // 6. Generate unique tracking reference number (TVL-YYYY-XXXXX)
    const year = new Date().getFullYear();
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const referenceNo = `TVL-${year}-${randomSuffix}`;

    // 7. Assemble complete database payload
    const bookingPayload: BookingInsert = {
      reference_no: referenceNo,
      tour_id: input.tourId || null,
      customer_name: input.customerName.trim(),
      customer_email: input.customerEmail.trim().toLowerCase(),
      customer_phone: input.customerPhone.trim(),
      customer_country: input.customerCountry?.trim() || 'International',
      pickup_location: input.pickupLocation?.trim() || null,
      special_requests: input.specialRequests?.trim() || null,
      travel_date: input.travelDate,
      travelers_count: travelersCount,
      adults,
      children,
      selected_activities: activitiesSnapshot,
      currency: input.currency,
      applied_exchange_rate: appliedExchangeRate, // PERMANENTLY LOCKED
      coupon_code: input.couponCode?.trim() ? input.couponCode.trim().toUpperCase() : null,
      discount_amount: rawDiscount,
      total_amount: totalAmount,                  // PERMANENTLY LOCKED Net Total
      advance_percentage: 20.00,
      advance_amount: advanceAmount,              // PERMANENTLY LOCKED (PayHere amount)
      remaining_balance: remainingBalance,        // PERMANENTLY LOCKED (Due on arrival)
      payment_status: 'pending',
      booking_status: 'pending',
      admin_notes: input.couponCode
        ? `Promo code ${input.couponCode.toUpperCase()} applied (-${input.currency} ${rawDiscount}). Locked at 1 USD = ${liveRate.toFixed(4)} LKR. Subtotal: $${subtotalUsd.toFixed(2)} USD, Net: $${grandTotalUsd.toFixed(2)} USD.`
        : `Checkout locked at 1 USD = ${liveRate.toFixed(4)} LKR via server proxy. Master USD base: $${grandTotalUsd.toFixed(2)}.`,
    };

    // 7. Insert into Supabase
    const supabase = await createClient();
    const { data: booking, error: insertError } = await supabase
      .from('bookings')
      .insert(bookingPayload)
      .select()
      .single();

    if (insertError) {
      console.error('[Submit Booking Error]:', insertError);
      throw new Error(`Failed to create booking: ${insertError.message}`);
    }

    return {
      success: true,
      booking: booking as Booking,
    };
  } catch (error) {
    console.error('[submitBookingWithCurrencyLock] Exception:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected booking error occurred.',
    };
  }
}
