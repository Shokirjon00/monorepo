/**
 * Admin passed relative endpoint paths and relied on the apiUrl prefix, client
 * passed absolute URLs, so the merged services resolve on the protocol.
 *
 * The guard on `typeof` matters: admin call sites can pass `undefined` (a dropdown
 * with no configured endpoint). The pre-merge code interpolated that into the URL
 * without complaining, so this must not throw either.
 */
export function resolveApiUrl(apiUrl: string, url: unknown): string {
  return typeof url === 'string' && url.startsWith('http') ? url : `${apiUrl}/${url}`;
}
