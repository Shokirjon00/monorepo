export function isPhone(): boolean {
  if (typeof window.matchMedia === 'function') {
    return window.matchMedia('(max-width: 767.98px)').matches;
  }
  return false;
}

export function isLandscapeTablet(): boolean {
  if (typeof window.matchMedia === 'function') {
    return window.matchMedia('(max-width: 1024px)').matches;
  }
  return false;
}
