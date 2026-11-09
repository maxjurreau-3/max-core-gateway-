import crypto from 'node:crypto';

export interface SessionPayload {
  sub: string;
  role: string;
  exp: number; // Unix timestamp in seconds
}

export function mintSovereignSessionCookie(
  payload: SessionPayload,
  secret: string
): string {
  const header = { alg: "HS256", typ: "JWT" };

  const base64UrlEncode = (data: string | Buffer): string => {
    const buffer = typeof data === 'string' ? Buffer.from(data, 'utf8') : data;
    return buffer
      .toString('base64')
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signingInput = `${encodedHeader}.${encodedPayload}`;

  // Generate HMAC-SHA256 signature using the shared high-entropy secret
  const signature = crypto
    .createHmac('sha256', secret)
    .update(signingInput)
    .digest();

  const encodedSignature = base64UrlEncode(signature);
  const token = `${encodedHeader}.${encodedPayload}.${encodedSignature}`;

  // Return formatted Set-Cookie string valid across all subdomains
  return `sovereign_session=${token}; Domain=.max-institute.org; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=86400`;
}

// Example usage:
const secret = process.env.HMAC_SECRET || "max_sec_9f8b2c4e7a1d3f6e8b0c2a4f6e8d1c3b5a7e9f2d4c6b8a0f2e4d6c8b0a2f4e6d";
const oneDayFromNow = Math.floor(Date.now() / 1000) + 86400;

const cookieString = mintSovereignSessionCookie(
  { sub: "max_admin_01", role: "architect", exp: oneDayFromNow },
  secret
);

console.log("Generated Cookie Header:\n", cookieString);
