import { decodeToken, isTokenExpired } from './jwt';

function makeToken(payload: object): string {
  const b64 = (o: object) => btoa(JSON.stringify(o)).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
  return `${b64({ alg: 'HS512', typ: 'JWT' })}.${b64(payload)}.signature`;
}

describe('jwt helpers', () => {
  it('decodes the payload', () => {
    const token = makeToken({ nameid: '7', unique_name: 'lola', exp: 2000000000 });
    expect(decodeToken(token)).toEqual({ nameid: '7', unique_name: 'lola', exp: 2000000000 });
  });

  it('decodes non-ASCII names', () => {
    const json = JSON.stringify({ unique_name: 'zoë', exp: 1 });
    const payload = btoa(String.fromCharCode(...new TextEncoder().encode(json)));
    expect(decodeToken(`x.${payload}.y`)?.unique_name).toBe('zoë');
  });

  it('returns null for missing or malformed tokens', () => {
    expect(decodeToken(null)).toBeNull();
    expect(decodeToken('not-a-jwt')).toBeNull();
    expect(decodeToken('a.%%%.c')).toBeNull();
  });

  it('treats missing and past expiry as expired', () => {
    expect(isTokenExpired(null)).toBe(true);
    expect(isTokenExpired({ nameid: '1', unique_name: 'a', exp: 100 }, 200_000)).toBe(true);
    expect(isTokenExpired({ nameid: '1', unique_name: 'a', exp: 300 }, 200_000)).toBe(false);
  });
});
