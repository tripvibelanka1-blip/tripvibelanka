import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface OpenErApiResponse {
  result: string;
  provider?: string;
  documentation?: string;
  terms_of_use?: string;
  time_last_update_unix?: number;
  time_last_update_utc?: string;
  time_next_update_unix?: number;
  time_next_update_utc?: string;
  base_code?: string;
  rates?: Record<string, number>;
}

// Resilient fallback exchange rate in case of network partition or upstream downtime
const FALLBACK_LKR_RATE = 328.0;

export async function GET() {
  try {
    // Next.js App Router fetch with 12-hour (43,200 seconds) server-side revalidation cache
    const response = await fetch('https://open.er-api.com/v6/latest/USD', {
      next: { revalidate: 43200 },
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Upstream exchange rate service returned HTTP ${response.status}`);
    }

    const data: OpenErApiResponse = await response.json();

    if (data.result !== 'success' || !data.rates || typeof data.rates.LKR !== 'number') {
      throw new Error('Malformed or incomplete response received from currency provider');
    }

    const rate = parseFloat(data.rates.LKR.toFixed(4));

    return NextResponse.json(
      {
        rate,
        base: 'USD',
        target: 'LKR',
        timestamp: data.time_last_update_unix
          ? data.time_last_update_unix * 1000
          : Date.now(),
        isFallback: false,
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=43200, stale-while-revalidate=86400',
        },
      }
    );
  } catch (error) {
    console.error('[Currency API Error] Failed to retrieve live USD/LKR exchange rate:', error);

    // High-availability graceful fallback: never break the client application
    return NextResponse.json(
      {
        rate: FALLBACK_LKR_RATE,
        base: 'USD',
        target: 'LKR',
        timestamp: Date.now(),
        isFallback: true,
        error: error instanceof Error ? error.message : 'Unknown currency fetch failure',
      },
      {
        status: 200, // Return 200 with fallback data so client applications remain functional
        headers: {
          'Cache-Control': 'no-store, max-age=0',
        },
      }
    );
  }
}
