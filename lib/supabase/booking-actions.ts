'use server';

import { z } from 'zod';
import crypto from 'crypto';
import { headers } from 'next/headers';
import { createAdminClient } from '@/utils/supabase/server';
import { checkRateLimit } from '@/lib/rate-limit';
import { getServerExchangeRate } from '@/lib/fx';
import { deriveBookingAccessToken, verifyBookingAccessToken } from '@/lib/tokens';
import { SelectedActivityItem } from '@/types/database';

// -----------------------------------------------------------------------------
// Validation Schemas
// -----------------------------------------------------------------------------

const BookingInputSchema = z.object({
  tourId: z.string().uuid('Please select a valid tour package'),
  vehicleId: z.string().uuid('Please select an executive fleet vehicle'),
  activityIds: z.array(z.string().uuid()).max(15).default([]),
  customerName: z.string().trim().min(2, 'Name is too short').max(100, 'Name is too long'),
  customerEmail: z.string().trim().toLowerCase().email('Invalid email address').max(254),
  customerPhone: z.string().trim().regex(/^\+?[0-9\s\-()]{7,25}$/, 'Invalid phone number format'),
  customerCountry: z.string().trim().max(100).nullish(),
  pickupLocation: z.string().trim().max(150).nullish(),
  specialRequests: z.string().trim().max(1000).nullish(),
  travelDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  adults: z.number().int().min(1, 'At least 1 adult required').max(30, 'Max 30 adults'),
  children: z.number().int().min(0).max(20).default(0),
  currency: z.enum(['USD', 'LKR']),
  couponCode: z.string().trim().max(50).nullish(),
  idempotencyKey: z.string().uuid('Invalid idempotency key format'),
  expectedTotalCents: z.number().int().positive().nullish(),
});

export type BookingInput = z.infer<typeof BookingInputSchema>;

export interface ServerPricingCalculation {
  tourRecord: any;
  vehicleRecord: any;
  tourTotalCents: number;
  vehicleTotalCents: number;
  activitiesTotalCents: number;
  subtotalCents: number;
  discountCents: number;
  grandTotalCents: number;
  currency: 'USD' | 'LKR';
  exchangeRate: number;
  totalAmount: number;
  advanceAmount: number;
  remainingBalance: number;
  activitiesSnapshot: SelectedActivityItem[];
}

/**
 * Authoritative Server-Side Pricing Engine
 * Computes exact integer cents directly from active database rows.
 */
async function computeServerPricing(
  db: ReturnType<typeof createAdminClient>,
  data: {
    tourId: string;
    vehicleId: string;
    activityIds: string[];
    adults: number;
    children: number;
    currency: 'USD' | 'LKR';
    couponCode?: string | null;
  }
): Promise<ServerPricingCalculation> {
  if (!db) throw new Error('Database service unavailable');

  const totalGuests = data.adults + data.children;
  const { rate: exchangeRate } = await getServerExchangeRate();

  const toCents = (n: number | string | null | undefined) => Math.round(Number(n || 0) * 100);

  // 1. Fetch & Verify Tour Package (Mandatory)
  const { data: tourRecord } = await db
    .from('tours')
    .select('id, title, duration_days, price_usd, min_guests, max_guests, is_active')
    .eq('id', data.tourId)
    .eq('is_active', true)
    .maybeSingle();

  if (!tourRecord) {
    throw new Error('Selected tour package is inactive or no longer available.');
  }

  if (totalGuests < (tourRecord.min_guests || 1)) {
    throw new Error(`Package "${tourRecord.title}" requires at least ${tourRecord.min_guests || 1} guest(s).`);
  }
  if (tourRecord.max_guests && totalGuests > tourRecord.max_guests) {
    throw new Error(`Package "${tourRecord.title}" accommodates a maximum of ${tourRecord.max_guests} guests.`);
  }

  const durationDays = tourRecord.duration_days || 1;
  const tourTotalCents = toCents(tourRecord.price_usd) * totalGuests;

  // 2. Fetch & Verify Fleet Vehicle (Mandatory)
  const { data: vehicleRecord } = await db
    .from('vehicles')
    .select('id, name, price_per_day_usd, passenger_capacity, is_active')
    .eq('id', data.vehicleId)
    .eq('is_active', true)
    .maybeSingle();

  if (!vehicleRecord) {
    throw new Error('Selected vehicle is inactive or no longer available.');
  }

  const vehicleCapacity = vehicleRecord.passenger_capacity || 3;
  if (totalGuests > vehicleCapacity) {
    throw new Error(`Selected vehicle (${vehicleRecord.name}) holds up to ${vehicleCapacity} passengers. Please select a larger vehicle for ${totalGuests} guests.`);
  }

  const vehicleTotalCents = toCents(vehicleRecord.price_per_day_usd) * durationDays;

  // 3. Fetch & Verify Activities
  const activitiesSnapshot: SelectedActivityItem[] = [];
  let activitiesTotalCents = 0;

  if (data.activityIds && data.activityIds.length > 0) {
    // Deduplicate incoming IDs
    const uniqueIds = Array.from(new Set(data.activityIds));
    const { data: acts } = await db
      .from('activities')
      .select('id, title, price, is_active')
      .in('id', uniqueIds)
      .eq('is_active', true);

    if (acts && acts.length > 0) {
      if (acts.length !== uniqueIds.length) {
        throw new Error('One or more selected activity add-ons are no longer available.');
      }

      for (const act of acts) {
        const itemPriceCents = toCents(act.price);
        const lineTotalCents = itemPriceCents * totalGuests;
        activitiesTotalCents += lineTotalCents;

        const unitInCurrency =
          data.currency === 'LKR'
            ? Math.round((itemPriceCents / 100) * exchangeRate)
            : parseFloat((itemPriceCents / 100).toFixed(2));
        const totalInCurrency =
          data.currency === 'LKR'
            ? Math.round((lineTotalCents / 100) * exchangeRate)
            : parseFloat((lineTotalCents / 100).toFixed(2));

        activitiesSnapshot.push({
          activity_id: act.id,
          title: act.title,
          price_per_person: unitInCurrency,
          quantity: totalGuests,
          total: totalInCurrency,
        });
      }
    }
  }

  // 4. Calculate Subtotal
  const subtotalCents = tourTotalCents + vehicleTotalCents + activitiesTotalCents;

  // 5. Server-Side Coupon Verification
  let discountCents = 0;
  if (data.couponCode && data.couponCode.trim()) {
    const cleanCode = data.couponCode.trim().toUpperCase();
    if (/^[A-Z0-9-]{2,32}$/.test(cleanCode)) {
      const today = new Date().toISOString().split('T')[0];

      const { data: banner } = await db
        .from('banners')
        .select('coupon_code, discount_type, discount_value, start_date, end_date, is_active')
        .eq('coupon_code', cleanCode)
        .eq('is_active', true)
        .maybeSingle();

      if (banner) {
        const isStarted = !banner.start_date || banner.start_date <= today;
        const isNotExpired = !banner.end_date || banner.end_date >= today;

        if (isStarted && isNotExpired) {
          const discVal = Number(banner.discount_value ?? 0);
          if (discVal > 0) {
            if (banner.discount_type === 'percentage') {
              discountCents = Math.round((subtotalCents * discVal) / 100);
            } else {
              discountCents = toCents(discVal);
            }
            discountCents = Math.min(discountCents, subtotalCents);
          }
        }
      }
    }
  }


  const grandTotalCents = Math.max(100, subtotalCents - discountCents);

  // 6. Currency Locking
  let totalAmount: number;
  let advanceAmount: number;
  let remainingBalance: number;

  if (data.currency === 'LKR') {
    totalAmount = Math.max(0, Math.round((grandTotalCents / 100) * exchangeRate));
    advanceAmount = Math.round(totalAmount * 0.20);
    remainingBalance = totalAmount - advanceAmount;
  } else {
    totalAmount = parseFloat((grandTotalCents / 100).toFixed(2));
    advanceAmount = parseFloat((totalAmount * 0.20).toFixed(2));
    remainingBalance = parseFloat((totalAmount - advanceAmount).toFixed(2));
  }

  return {
    tourRecord,
    vehicleRecord,
    tourTotalCents,
    vehicleTotalCents,
    activitiesTotalCents,
    subtotalCents,
    discountCents,
    grandTotalCents,
    currency: data.currency,
    exchangeRate,
    totalAmount,
    advanceAmount,
    remainingBalance,
    activitiesSnapshot,
  };
}

/**
 * Server Action: Quote Booking Pricing in Real-Time
 * Used by review step to display 100% authoritative server quotes.
 */
export async function quoteBooking(input: unknown) {
  try {
    const QuoteSchema = z.object({
      tourId: z.string().uuid(),
      vehicleId: z.string().uuid(),
      activityIds: z.array(z.string().uuid()).default([]),
      adults: z.number().int().min(1).max(30),
      children: z.number().int().min(0).max(20).default(0),
      currency: z.enum(['USD', 'LKR']),
      couponCode: z.string().trim().max(50).nullish(),
    });

    const parsed = QuoteSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: 'Invalid quote parameters' };
    }

    // Rate limit quotes
    const headersList = await headers();
    const forwarded = headersList.get('x-forwarded-for');
    const realIp = headersList.get('x-real-ip');
    const ip = realIp || (forwarded ? forwarded.split(',')[0].trim() : '127.0.0.1');

    const rateCheck = await checkRateLimit('quote_booking', ip, 30, 10 * 60 * 1000);
    if (!rateCheck.success) {
      return { success: false, error: 'Too many quote requests. Please wait a moment.' };
    }

    const db = createAdminClient();
    if (!db) return { success: false, error: 'Database service unavailable' };

    const calculation = await computeServerPricing(db, parsed.data);

    return {
      success: true,
      quote: {
        totalCents: calculation.grandTotalCents,
        totalAmount: calculation.totalAmount,
        advanceAmount: calculation.advanceAmount,
        remainingBalance: calculation.remainingBalance,
        currency: calculation.currency,
        exchangeRate: calculation.exchangeRate,
        discountAmount:
          calculation.currency === 'LKR'
            ? Math.round((calculation.discountCents / 100) * calculation.exchangeRate)
            : parseFloat((calculation.discountCents / 100).toFixed(2)),
      },
    };
  } catch (err: any) {
    return { success: false, error: err.message || 'Pricing quote failed' };
  }
}

/**
 * Server Action: Submit Booking (Service-Role Insert with Single Source of Truth)
 */
export async function submitBooking(rawInput: unknown): Promise<{
  success: boolean;
  code?: string;
  booking?: {
    id: string;
    reference_no: string;
    advance_amount: number;
    total_amount: number;
    remaining_balance: number;
    currency: 'USD' | 'LKR';
  };
  accessToken?: string;
  error?: string;
}> {
  try {
    // 1. Strict Schema Validation
    const parseResult = BookingInputSchema.safeParse(rawInput);
    if (!parseResult.success) {
      const firstIssue = parseResult.error.issues[0]?.message || 'Please check your reservation details.';
      return { success: false, error: firstIssue };
    }
    const input = parseResult.data;

    // 2. Rate Limiting Check
    const headersList = await headers();
    const forwarded = headersList.get('x-forwarded-for');
    const realIp = headersList.get('x-real-ip');
    const ip = realIp || (forwarded ? forwarded.split(',')[0].trim() : '127.0.0.1');

    const rateLimit = await checkRateLimit('booking', ip, 8, 10 * 60 * 1000);
    if (!rateLimit.success) {
      return { success: false, error: 'Too many booking attempts. Please wait 10 minutes.' };
    }

    // 3. Travel Date Constraints (Min: +24h, Max: +2 years)
    const minLeadDate = new Date(Date.now() + 864e5).toISOString().split('T')[0];
    const maxFutureDate = new Date(Date.now() + 730 * 864e5).toISOString().split('T')[0];

    if (input.travelDate < minLeadDate) {
      return { success: false, error: 'Departure date must be at least 24 hours in advance.' };
    }
    if (input.travelDate > maxFutureDate) {
      return { success: false, error: 'Reservations cannot be booked more than 2 years in advance.' };
    }

    // 4. Admin Database Client
    const db = createAdminClient();
    if (!db) {
      return { success: false, error: 'Database service unavailable' };
    }

    // 5. Generate Request Fingerprint
    const requestHash = crypto.createHash('sha256').update(JSON.stringify({
      t: input.tourId,
      v: input.vehicleId,
      a: [...input.activityIds].sort(),
      ad: input.adults,
      ch: input.children,
      d: input.travelDate,
      c: input.currency,
      k: input.couponCode ? input.couponCode.trim().toUpperCase() : null,
    })).digest('hex');

    // 6. Idempotency Check: Same key with matching fingerprint returns existing row
    const { data: existing } = await db
      .from('bookings')
      .select('id, reference_no, advance_amount, total_amount, remaining_balance, currency, request_hash')
      .eq('idempotency_key', input.idempotencyKey)
      .maybeSingle();

    if (existing) {
      if (existing.request_hash && existing.request_hash !== requestHash) {
        return {
          success: false,
          code: 'KEY_REUSED',
          error: 'This booking session was already finalized with different parameters. Please refresh to start a fresh reservation.',
        };
      }
      return {
        success: true,
        booking: {
          id: existing.id,
          reference_no: existing.reference_no,
          advance_amount: Number(existing.advance_amount),
          total_amount: Number(existing.total_amount),
          remaining_balance: Number(existing.remaining_balance),
          currency: existing.currency as 'USD' | 'LKR',
        },
        accessToken: deriveBookingAccessToken(existing.id),
      };
    }

    // 7. Authoritative Server Pricing Calculation
    const pricing = await computeServerPricing(db, {
      tourId: input.tourId,
      vehicleId: input.vehicleId,
      activityIds: input.activityIds,
      adults: input.adults,
      children: input.children,
      currency: input.currency,
      couponCode: input.couponCode || null,
    });

    // 8. Expected Total Guard (Protects against client/server price drift)
    if (input.expectedTotalCents && input.expectedTotalCents !== pricing.grandTotalCents) {
      return {
        success: false,
        code: 'PRICE_CHANGED',
        error: 'Currency exchange rates or package prices have updated. Please review the updated quote.',
      };
    }

    // 9. Generate Secure Reference No
    const year = new Date().getFullYear();
    const randomHex = crypto.randomBytes(4).toString('hex').toUpperCase();
    const referenceNo = `TVL-${year}-${randomHex}`;
    const totalTravelers = input.adults + input.children;

    // 10. Insert into Database (access token is derived via HMAC, not stored raw!)
    const { data: newBooking, error: insertError } = await db
      .from('bookings')
      .insert({
        reference_no: referenceNo,
        idempotency_key: input.idempotencyKey,
        request_hash: requestHash,
        tour_id: input.tourId,
        vehicle_id: input.vehicleId,
        customer_name: input.customerName,
        customer_email: input.customerEmail,
        customer_phone: input.customerPhone,
        customer_country: input.customerCountry || 'International',
        pickup_location: input.pickupLocation || null,
        special_requests: input.specialRequests || null,
        travel_date: input.travelDate,
        travelers_count: totalTravelers,
        adults: input.adults,
        children: input.children,
        selected_activities: pricing.activitiesSnapshot,
        currency: input.currency,
        applied_exchange_rate: pricing.exchangeRate,
        coupon_code: input.couponCode ? input.couponCode.trim().toUpperCase() : null,
        discount_amount:
          input.currency === 'LKR'
            ? Math.round((pricing.discountCents / 100) * pricing.exchangeRate)
            : parseFloat((pricing.discountCents / 100).toFixed(2)),
        total_amount: pricing.totalAmount,
        advance_percentage: 20.0,
        advance_amount: pricing.advanceAmount,
        remaining_balance: pricing.remainingBalance,
        payment_status: 'pending',
        booking_status: 'pending',
        admin_notes: null,
      })
      .select('id, reference_no, advance_amount, total_amount, remaining_balance, currency')
      .single();

    // Handle parallel duplicate insert race (unique violation 23505)
    if (insertError) {
      if (insertError.code === '23505') {
        const { data: racedExisting } = await db
          .from('bookings')
          .select('id, reference_no, advance_amount, total_amount, remaining_balance, currency, request_hash')
          .eq('idempotency_key', input.idempotencyKey)
          .maybeSingle();

        if (racedExisting) {
          if (racedExisting.request_hash === requestHash) {
            return {
              success: true,
              booking: {
                id: racedExisting.id,
                reference_no: racedExisting.reference_no,
                advance_amount: Number(racedExisting.advance_amount),
                total_amount: Number(racedExisting.total_amount),
                remaining_balance: Number(racedExisting.remaining_balance),
                currency: racedExisting.currency as 'USD' | 'LKR',
              },
              accessToken: deriveBookingAccessToken(racedExisting.id),
            };
          } else {
            return {
              success: false,
              code: 'KEY_REUSED',
              error: 'This booking session was already finalized with different parameters. Please refresh to start a fresh reservation.',
            };
          }
        }
      }

      console.error('[submitBooking] DB Insert Error:', insertError);
      return { success: false, error: 'Unable to reserve journey at this time. Please try again or contact concierge.' };
    }

    if (!newBooking || !newBooking.id) {
      console.error('[submitBooking] Insert returned empty row without error');
      return { success: false, error: 'Failed to generate reservation voucher. Please contact concierge.' };
    }

    const accessToken = deriveBookingAccessToken(newBooking.id);

    return {
      success: true,
      booking: {
        id: newBooking.id,
        reference_no: newBooking.reference_no,
        advance_amount: Number(newBooking.advance_amount),
        total_amount: Number(newBooking.total_amount),
        remaining_balance: Number(newBooking.remaining_balance),
        currency: newBooking.currency as 'USD' | 'LKR',
      },
      accessToken,
    };
  } catch (error: any) {
    console.error('[submitBooking] Exception:', error);
    return {
      success: false,
      error: error.message || 'An unexpected error occurred while placing your reservation.',
    };
  }
}

/**
 * Server Action: Secure Payment Status Polling
 * Validates HMAC-derived token and returns only minimum status fields (no PII).
 */
export async function getBookingPaymentStatus(
  bookingId: string,
  accessToken: string
): Promise<{
  success: boolean;
  paymentStatus?: string;
  bookingStatus?: string;
  referenceNo?: string;
  payherePaymentId?: string | null;
  error?: string;
}> {
  try {
    if (!bookingId || !accessToken) {
      return { success: false, error: 'Unauthorized request' };
    }

    // Rate limit status polling
    const headersList = await headers();
    const forwarded = headersList.get('x-forwarded-for');
    const realIp = headersList.get('x-real-ip');
    const ip = realIp || (forwarded ? forwarded.split(',')[0].trim() : '127.0.0.1');

    const rateCheck = await checkRateLimit('status_poll', ip, 60, 10 * 60 * 1000);
    if (!rateCheck.success) {
      return { success: false, error: 'Too many status check requests.' };
    }

    // Verify token using HMAC derivation (constant-time)
    if (!verifyBookingAccessToken(bookingId, accessToken)) {
      return { success: false, error: 'Invalid access credentials' };
    }

    const db = createAdminClient();
    if (!db) return { success: false, error: 'Database service unavailable' };

    const { data: booking, error } = await db
      .from('bookings')
      .select('id, reference_no, payment_status, booking_status, payhere_payment_id')
      .eq('id', bookingId)
      .maybeSingle();

    if (error || !booking) {
      return { success: false, error: 'Booking not found' };
    }

    return {
      success: true,
      paymentStatus: booking.payment_status,
      bookingStatus: booking.booking_status,
      referenceNo: booking.reference_no,
      payherePaymentId: booking.payhere_payment_id,
    };
  } catch (err) {
    return { success: false, error: 'Unable to check status' };
  }
}
