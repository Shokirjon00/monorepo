export const ACCESS_TOKEN_KEY = 'accessToken';
export const REFRESH_TOKEN_KEY = 'refreshToken';
export const DEVICE_ID = 'device-id';

export const TODAY_ID = 'd9d02ca0-16e3-4072-8f85-00e59e90c25f';
export const PERIOD_ID = 'faea99d1-30a5-45c8-b00e-ed797b74e420';
export const IP_OR_DOMAIN_PATTERN = /^((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])$/;
export const PASSWORD_PATTERN = '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@#$!%*?&])[A-Za-z\\d!@#$%^&*]{8,}$';
export const EMAIL_PATTERN = '^[\\w\\.-]+@[a-zA-Z0-9-]+(?:\\.[a-zA-Z0-9-]+)+$';
export const EMAIL_ESKHATA_PATTERN = '^[\\w.-]+@eskhata\\.(tj|com)$';
export const PHONE_NUMBER_VALIDATION = '((992){1}\\d{9}|(7){1}\\d{10}){1}';
export const LOGIN_PATTERN = '^[a-zA-Z]+[.a-zA-Z0-9_-]*';
export const DATE_PATTERN = '^(19[0-9]{2}|2[0-9]{3})-(0[1-9]|1[012])-([123]0|[012][1-9]|31)$';
export const PHONE_PREFIX = '+992';
export const MAX_PHONE_NUMBER = 4;
export const ANALYTICS_PERIOD_DAY = 31;
export const FILTER_LIFETIME_MS = 2 * 60 * 60 * 1000;

export { isPhone, isLandscapeTablet } from '@eskhata/util';
