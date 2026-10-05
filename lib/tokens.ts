import crypto from 'crypto';

/**
 * Secret key used to derive tamper-proof, stateless access tokens for bookings.
 * Falls back to PAYHERE_MERCHANT_SECRET if BOOKING_TOKEN_SECRET is not explicitly set.
 */
function getTokenSecret(): string {
  const secret =
    process.env.BOOKING_TOKEN_SECRET ||
    process.env.PAYHERE_MERCHANT_SECRET ||
    process.env.NEXT_SECRET_SUPABASE_SERVICE_ROLE_KEY;

  if (!secret) {
    throw new Error('Server misconfiguration: Token derivation secret unavailable');
  }
  return secret;
}

/**
 * Derives a stateless, deterministic HMAC-SHA256 access token from a booking ID.
 * Eliminates the need to store raw access tokens in the database.
 */
export function deriveBookingAccessToken(bookingId: string): string {
  if (!bookingId) throw new Error('Missing booking ID for token derivation');
  const secret = getTokenSecret();
  return crypto.createHmac('sha256', secret).update(bookingId).digest('base64url');
}

/**
 * Timing-safe verification of a client-provided booking access token.
 */
export function verifyBookingAccessToken(bookingId: string, providedToken?: string | null): boolean {
  if (!bookingId || !providedToken) return false;
  try {
    const expectedToken = deriveBookingAccessToken(bookingId);
    const expectedBuf = Buffer.from(expectedToken, 'utf-8');
    const providedBuf = Buffer.from(providedToken, 'utf-8');

    if (expectedBuf.length !== providedBuf.length) {
      return false;
    }

    return crypto.timingSafeEqual(expectedBuf, providedBuf);
  } catch (err) {
    return false;
  }
}
