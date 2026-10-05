// In-memory sliding window rate limiter
// Suitable for Node.js / Next.js server actions and API route protection

interface RateLimitRecord {
  timestamps: number[];
}

const memoryStore = new Map<string, RateLimitRecord>();

// Cleanup stale records every 5 minutes to prevent memory leaks
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of memoryStore.entries()) {
      record.timestamps = record.timestamps.filter((t) => now - t < 15 * 60 * 1000);
      if (record.timestamps.length === 0) {
        memoryStore.delete(key);
      }
    }
  }, 5 * 60 * 1000).unref?.();
}

/**
 * Check if an action is within rate limits.
 * @param prefix Action identifier (e.g. 'booking', 'hash', 'coupon')
 * @param identifier Client IP or unique client identifier
 * @param maxRequests Maximum requests allowed within the window
 * @param windowMs Window duration in milliseconds (default: 10 minutes)
 */
export async function checkRateLimit(
  prefix: string,
  identifier: string,
  maxRequests: number = 10,
  windowMs: number = 10 * 60 * 1000
): Promise<{ success: boolean; remaining: number }> {
  const now = Date.now();
  const key = `${prefix}:${identifier}`;

  let record = memoryStore.get(key);
  if (!record) {
    record = { timestamps: [] };
    memoryStore.set(key, record);
  }

  // Filter timestamps within the current sliding window
  record.timestamps = record.timestamps.filter((t) => now - t < windowMs);

  if (record.timestamps.length >= maxRequests) {
    return { success: false, remaining: 0 };
  }

  record.timestamps.push(now);
  return { success: true, remaining: maxRequests - record.timestamps.length };
}
