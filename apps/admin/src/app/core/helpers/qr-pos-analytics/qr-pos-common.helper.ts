import 'moment/locale/ru';
import { IMetricDeltaInterface } from '@modules/analytics/interfaces/qr-pos-analytics.interface';
import { PeriodKind } from './qr-pos-period.helper';

export const PALETTE = ['#4E49CE', '#2C7BE3', '#61BE40', '#FF8C00', '#A148C0', '#2BB6A3', '#DA1E37', '#7D8597', '#0050C8', '#5BB318'];
export const CURRENCY = 'TJS';

export const round1 = (n: number): number => Math.round((n ?? 0) * 10) / 10;
export const round2 = (n: number): number => Math.round((n ?? 0) * 100) / 100;

export const formatDay = (date: string): string => {
  const parts = (date ?? '').slice(0, 10).split('-');
  return parts.length === 3 ? `${parts[2]}.${parts[1]}` : (date ?? '');
};

const RU_MONTHS_SHORT = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
const RU_WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

export const formatPointByKind = (date: string, kind?: PeriodKind): string => {
  const d = date ?? '';
  switch (kind) {
    case 'today':
      return d.length >= 16 ? d.slice(11, 16) : formatDay(d);
    case 'week': {
      const wd = new Date(d.slice(0, 10)).getDay();
      return wd >= 1 && wd <= 7 ? RU_WEEKDAYS[wd - 1] : formatDay(d);
    }
    case 'month':
    case 'quarter':
      return String(parseInt(d.slice(8, 10), 10) || formatDay(d));
    case 'year': {
      const mo = parseInt(d.slice(5, 7), 10);
      return mo >= 1 && mo <= 12 ? RU_MONTHS_SHORT[mo - 1] : formatDay(d);
    }
    default:
      return formatDay(d);
  }
};

export const deltaPercentOf = (d: IMetricDeltaInterface | undefined): number | undefined => {
  if (!d) return undefined;
  if (d.deltaPercent !== undefined && d.deltaPercent !== null) return round1(d.deltaPercent);
  return d.previous ? round1((d.delta / d.previous) * 100) : undefined;
};

export const relDelta = (current: number, previous: number): number | undefined =>
  previous ? round1(((current - previous) / previous) * 100) : undefined;

export const pct = (part: number, total: number): number => (total > 0 ? Math.round((part / total) * 100) : 0);

export const trendOf = (d: IMetricDeltaInterface | undefined, points = 10): number[] => {
  const cur = d?.current ?? 0;
  const prev = d?.previous ?? cur;
  return Array.from({ length: points }, (_, i) => {
    const t = i / (points - 1);
    const base = prev + (cur - prev) * t;
    const wobble = Math.sin(i * 1.2) * Math.abs(cur - prev) * 0.08;
    return round2(base + wobble);
  });
};
