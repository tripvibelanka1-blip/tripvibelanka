const FALLBACK_LKR_RATE = 328.0;

/**
 * Server-only helper to fetch the latest cached exchange rate.
 * Uses Next.js 12-hour server-side revalidation cache.
 * Isolated from 'use server' actions to prevent unnecessary public RPC exposure.
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
