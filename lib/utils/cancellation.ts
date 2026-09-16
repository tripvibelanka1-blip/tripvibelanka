/**
 * Tripvibe Lanka - Cancellation & Refund Policy Engine
 * 
 * Policy Rules:
 * - 30 days or more before tour: Full refund of advance (100%)
 * - 15 – 29 days before tour: Partial refund of advance (50%)
 * - Less than 15 days before tour: No refund of advance (0% - advance retained)
 * - Tour date passed / No-show: No refund (0%)
 */

export interface CancellationEligibility {
  daysUntilTour: number;
  percentage: 100 | 50 | 0;
  tier: '30_plus' | '15_to_29' | 'under_15' | 'past_date';
  tierTitle: string;
  policySummary: string;
  refundAmount: number;
  retainedAmount: number;
  badgeClass: string;
  pillColor: 'emerald' | 'amber' | 'rose' | 'slate';
}

export function calculateCancellationEligibility(
  travelDateStr: string,
  advanceAmount: number
): CancellationEligibility {
  const now = new Date();
  // Standardize both to midnight local time to count full calendar days
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Parse YYYY-MM-DD safely
  const parts = travelDateStr.split('-');
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  const travelDate = new Date(year, month, day);

  const diffMs = travelDate.getTime() - today.getTime();
  const daysUntilTour = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  const safeAdvance = Math.max(0, Number(advanceAmount) || 0);

  if (daysUntilTour >= 30) {
    return {
      daysUntilTour,
      percentage: 100,
      tier: '30_plus',
      tierTitle: '30+ Days Notice (Full Refund)',
      policySummary: 'Customer notified 30 or more days before departure. Eligible for 100% full refund of the 20% advance payment.',
      refundAmount: safeAdvance,
      retainedAmount: 0,
      badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      pillColor: 'emerald',
    };
  }

  if (daysUntilTour >= 15) {
    const halfRefund = Math.round((safeAdvance * 0.5) * 100) / 100;
    const halfRetained = Math.round((safeAdvance - halfRefund) * 100) / 100;
    return {
      daysUntilTour,
      percentage: 50,
      tier: '15_to_29',
      tierTitle: '15 – 29 Days Notice (50% Refund)',
      policySummary: 'Customer notified between 15 and 29 days before departure. Eligible for 50% partial refund of the advance payment.',
      refundAmount: halfRefund,
      retainedAmount: halfRetained,
      badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
      pillColor: 'amber',
    };
  }

  if (daysUntilTour >= 0) {
    return {
      daysUntilTour,
      percentage: 0,
      tier: 'under_15',
      tierTitle: 'Less than 15 Days Notice (No Refund)',
      policySummary: 'Late cancellation within 14 days of departure. Advance payment is retained per terms to cover vehicle & chauffeur reservations.',
      refundAmount: 0,
      retainedAmount: safeAdvance,
      badgeClass: 'bg-rose-50 text-rose-800 border-rose-200',
      pillColor: 'rose',
    };
  }

  return {
    daysUntilTour,
    percentage: 0,
    tier: 'past_date',
    tierTitle: 'Departure Date Passed / No-Show',
    policySummary: 'The tour departure date has already passed. Advance payment is non-refundable.',
    refundAmount: 0,
    retainedAmount: safeAdvance,
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
    pillColor: 'slate',
  };
}
