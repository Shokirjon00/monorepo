export const ACCESS_TOKEN_KEY = 'accessToken';
export const REFRESH_TOKEN_KEY = 'refreshToken';
export const DEVICE_ID = 'device-id';

export const TODAY_ID = 'd9d02ca0-16e3-4072-8f85-00e59e90c25f';
export const PERIOD_ID = 'faea99d1-30a5-45c8-b00e-ed797b74e420';

export const PASSWORD_PATTERN = '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@#$!%*?&])[A-Za-z\\d!@#$%^&*]{8,}$';
export const PHONE_NUMBER_VALIDATION = '(^(\\+?992){1}\\d{9}|^(7){1}\\d{10}){1}$';
export const LOGIN_PATTERN = '^[a-zA-Z]+[.a-zA-Z0-9_-]*';
export const ONLY_STRING_VALIDATION = '^[A-Za-zА-ЯЁа-яё]+$';
export const NAME_PATTERN = '^[^0-9][a-zA-Z0-9а-яА-Я]*';

export const SPECIAL_REPORT_ID = '2d1dd4b9-cda1-40c9-9075-13dd531651a8';
export const RECONCILIATION_REPORT_ID = 'dbc7c9e9-2f8a-4aff-8b31-05c32eefb6cf';
export const ANALYTICS_PERIOD_DAY = 31;
export const MAX_PHONE_NUMBER = 4;

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
