export function extractCookies(headers: Headers) {
  return headers.getSetCookie().join('; ');
}
