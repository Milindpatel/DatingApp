/** Claims the API puts in its JWT (see AuthController on the API). */
export interface DecodedToken {
  nameid: string;
  unique_name: string;
  exp: number;
}

/** Decodes a JWT payload without verifying it. Verification is the API's job. */
export function decodeToken(token: string | null): DecodedToken | null {
  if (!token) return null;
  const payload = token.split('.')[1];
  if (!payload) return null;
  try {
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
    const bytes = Uint8Array.from(atob(padded), (c) => c.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(bytes)) as DecodedToken;
  } catch {
    return null;
  }
}

export function isTokenExpired(token: DecodedToken | null, now = Date.now()): boolean {
  return !token || typeof token.exp !== 'number' || token.exp * 1000 <= now;
}
