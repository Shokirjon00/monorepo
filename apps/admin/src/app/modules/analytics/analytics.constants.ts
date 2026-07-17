import { ITab } from '@core/interfaces/header.interface';

export const ANALYTICS_TABS: ITab[] = [
  { label: 'Аналитика', path: '/analytics/overview', permissionName: 'Analytic' },
  { label: 'QR/POS Аналитика', path: '/analytics/qr-pos' },
];
