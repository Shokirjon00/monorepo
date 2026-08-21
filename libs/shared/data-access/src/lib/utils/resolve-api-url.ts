export function resolveApiUrl(apiUrl: string, url: unknown): string {
  return typeof url === 'string' && url.startsWith('http') ? url : `${apiUrl}/${url}`;
}
