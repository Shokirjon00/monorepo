import {
  IQrPosAcquiringStructure,
  IQrPosDynamics,
  IQrPosGeography,
  IQrPosMetricCard,
  IQrPosPlanFactForecast,
} from '@modules/analytics/qr-pos-analytics/interfaces/qr-pos-analytics.interface';
import {
  IByServiceTypeInterface,
  IMetricDeltaInterface,
  IPlanFactForecastInterface,
  IRegionInterface,
  ISummaryCardsInterface,
  ITurnoverDynamicsInterface,
} from '@modules/analytics/interfaces/qr-pos-analytics.interface';
import { CURRENCY, deltaPercentOf, formatPointByKind, round1, round2, trendOf } from './qr-pos-common.helper';
import { PeriodKind } from './qr-pos-period.helper';

export function mapSummaryCards(dto: ISummaryCardsInterface): IQrPosMetricCard[] {
  if (!dto) return [];
  const card = (
    key: string, title: string, d: IMetricDeltaInterface,
    opt: { unit?: string; color?: string; colorKey?: string; icon?: string; growthIsPositive?: boolean } = {},
  ): IQrPosMetricCard => ({
    key, title,
    value: round2(d?.current ?? 0),
    unit: opt.unit,
    deltaPercent: deltaPercentOf(d),
    comparisonValue: round2(d?.previous ?? 0),
    comparisonUnit: opt.unit,
    trend: trendOf(d),
    color: opt.color,
    colorKey: opt.colorKey,
    icon: opt.icon,
    growthIsPositive: opt.growthIsPositive,
  });

  return [
    card('turnover', 'Оборот', dto.turnover, { unit: CURRENCY, color: '#2C7BE3', colorKey: 'blue', icon: 'company.svg' }),
    card('count', 'Количество транзакций', dto.transactionCount, { color: '#A148C0', colorKey: 'purple', icon: 'day.svg' }),
    card('avg', 'Средний чек', dto.averageCheck, { unit: CURRENCY, color: '#61BE40', colorKey: 'green', icon: 'week.svg' }),
    card('success', 'Успешные операции', dto.successRate, { unit: '%', color: '#2BB6A3', colorKey: 'teal', icon: 'checkmark-double.svg' }),
    card('refund', 'Возврат / Отмена', dto.refundCancelAmount, { unit: CURRENCY, color: '#FF8C00', colorKey: 'orange', icon: 'period.svg' }),
  ];
}

export function mapTurnoverDynamics(dto: ITurnoverDynamicsInterface, kind?: PeriodKind): IQrPosDynamics {
  const cur = dto?.currentPeriod ?? [];
  const prev = dto?.previousPeriod ?? [];

  return {
    categories: cur.map(p => formatPointByKind(p.date, kind)),
    fact: cur.map(p => round2(p.amount)),
    plan: cur.map((_, i) => (prev[i] ? round2(prev[i].amount) : null)) as number[],
  };
}

export function mapPlanFactForecast(dto: IPlanFactForecastInterface): IQrPosPlanFactForecast {
  return { fact: round2(dto?.fact ?? 0), plan: round2(dto?.plan ?? 0), forecast: round2(dto?.forecast ?? 0), currency: CURRENCY, year: dto?.year, quarter: dto?.quarter };
}

export function mapByServiceType(dto: IByServiceTypeInterface): IQrPosAcquiringStructure {
  return {
    total: round2(dto?.totalAmount ?? 0),
    currency: CURRENCY,
    items: [
      { key: 'qr', label: 'QR', value: round2(dto?.qrAmount ?? 0), percent: round1(dto?.qrPercent ?? 0), color: '#61BE40' },
      { key: 'pos', label: 'POS', value: round2(dto?.posAmount ?? 0), percent: round1(dto?.posPercent ?? 0), color: '#2C7BE3' },
    ],
  };
}

export function mapByRegionTop5(dto: IRegionInterface[]): IQrPosGeography {
  const regions = (dto ?? []).map(r => ({
    regionId: r.regionId,
    name: r.regionName,
    turnover: round2(r.amount),
    share: round1(r.sharePercent),
  }));
  return { total: regions.reduce((s, r) => s + r.turnover, 0), currency: CURRENCY, regions };
}
