import {
  IMetricCard,
  IPlanFactForecast,
  IRankItem,
  ITimeSeries,
  ITurnoverForecast,
} from '@modules/analytics/merchant-activity/interfaces/merchant-activity.interface';
import {
  IForecastTurnoverInterface,
  IMerchantRankInterface,
  IMerchantsActivityCardsInterface,
  IMerchantsActivityDynamicsInterface,
  IMerchantWithoutTxInterface,
  IMetricDeltaInterface,
  IParkCardsInterface,
  IPlanFactForecastInterface,
} from '@modules/analytics/interfaces/qr-pos-analytics.interface';
import {
  CURRENCY,
  deltaPercentOf,
  formatDay,
  formatPointByKind,
  PALETTE,
  pct,
  relDelta,
  round1,
  round2,
} from './qr-pos-common.helper';
import { PeriodKind } from './qr-pos-period.helper';

export function mapMerchantsActivityCards(dto: IMerchantsActivityCardsInterface): IMetricCard[] {
  if (!dto) return [];
  const deltaCard = (
    key: string, title: string, d: IMetricDeltaInterface, growthIsPositive?: boolean,
  ): IMetricCard => ({
    key, title,
    value: d?.current ?? 0,
    comparisonValue: d?.previous ?? 0,
    deltaPercent: deltaPercentOf(d),
    growthIsPositive,
  });

  return [
    deltaCard('total', 'Всего торговых точек', dto.totalMerchants),
    deltaCard('active', 'Активные', dto.activeMerchants),
    deltaCard('inactive', 'Неактивные', dto.inactiveMerchants, false),
    {
      key: 'conversion', title: 'Конверсия активности',
      value: round2(dto.conversionPercent), unit: '%',
      comparisonValue: round2(dto.previousConversionPercent), comparisonUnit: '%',
      deltaPercent: round2(dto.conversionPercent - dto.previousConversionPercent),
    },
    {
      key: 'no-tx', title: `Без транзакций > ${dto.inactivityDays} дней`,
      value: dto.merchantsWithoutTransactions, growthIsPositive: false,
    },
  ];
}

export function mapMerchantsActivityDynamics(dto: IMerchantsActivityDynamicsInterface, kind?: PeriodKind): ITimeSeries {
  const cur = dto?.currentPeriod ?? [];
  const prev = dto?.previousPeriod ?? [];

  return {
    categories: cur.map(p => formatPointByKind(p.date, kind)),
    fact: cur.map(p => p.activeMerchantCount),
    plan: cur.map((_, i) => (prev[i] ? prev[i].activeMerchantCount : null)) as number[],
  };
}

export function mapMerchantsPlanFactForecast(dto: IPlanFactForecastInterface): IPlanFactForecast {
  return { fact: dto?.fact ?? 0, plan: dto?.plan ?? 0, forecast: round2(dto?.forecast ?? 0), unit: 'точек' };
}

export function mapTopByTurnover(dto: IMerchantRankInterface[]): IRankItem[] {
  return (dto ?? []).map((m, i) => ({
    rank: i + 1,
    name: m.merchantName,
    value: round2(m.amount),
    secondary: round1(m.sharePercent),
  }));
}

export function mapWithoutTransactions(dto: IMerchantWithoutTxInterface[]): IRankItem[] {
  return (dto ?? []).map((m, i) => ({
    rank: i + 1,
    name: m.merchantName,
    value: m.daysWithoutTransactions,
  }));
}

export function mapParkTop(dto: IMerchantRankInterface[]): IRankItem[] {
  return (dto ?? []).map((m, i) => ({
    rank: i + 1,
    name: m.merchantName,
    value: round2(m.amount),
    percent: round1(m.sharePercent),
    color: PALETTE[i % PALETTE.length],
  }));
}

export function mapParkCards(dto: IParkCardsInterface, label: 'POS' | 'QR'): IMetricCard[] {
  if (!dto) return [];
  const total = dto.totalPoses?.current ?? 0;
  return [
    {
      key: 'total', title: `Общий парк ${label}`,
      value: dto.totalPoses?.current ?? 0, comparisonValue: dto.totalPoses?.previous ?? 0,
      deltaPercent: deltaPercentOf(dto.totalPoses),
    },
    {
      key: 'active', title: `Активные ${label}`,
      value: dto.activePoses?.current ?? 0, comparisonValue: dto.activePoses?.previous ?? 0,
      deltaPercent: deltaPercentOf(dto.activePoses),
      gauge: { percent: pct(dto.activePoses?.current ?? 0, total), color: '#61BE40' },
    },
    {
      key: 'inactive', title: `Неактивные ${label}`, growthIsPositive: false,
      value: dto.inactivePoses?.current ?? 0, comparisonValue: dto.inactivePoses?.previous ?? 0,
      deltaPercent: deltaPercentOf(dto.inactivePoses),
      gauge: { percent: pct(dto.inactivePoses?.current ?? 0, total), color: '#DA1E37' },
    },
    {
      key: 'efficiency', title: `Эффективность ${label}`,
      value: round1(dto.efficiencyPercent), unit: '%',
      comparisonValue: round1(dto.previousEfficiencyPercent), comparisonUnit: '%',
      deltaPercent: round1(dto.efficiencyPercent - dto.previousEfficiencyPercent),
    },
    {
      key: 'avg', title: `Средний оборот на ${label}`,
      value: round2(dto.averageTurnoverPerDevice), unit: CURRENCY,
      comparisonValue: round2(dto.previousAverageTurnoverPerDevice), comparisonUnit: CURRENCY,
      deltaPercent: relDelta(dto.averageTurnoverPerDevice, dto.previousAverageTurnoverPerDevice),
    },
  ];
}

export function mapForecast(dto: IForecastTurnoverInterface): ITurnoverForecast {
  const factPts = dto?.fact ?? [];
  const forePts = dto?.isForecastAvailable ? (dto?.forecast ?? []) : [];

  const categories = [...factPts, ...forePts].map(p => formatDay(p.date));

  const fact = [
    ...factPts.map(p => round2(p.amount)),
    ...forePts.map((): null => null),
  ] as number[];

  const lastFact = factPts.length ? round2(factPts[factPts.length - 1].amount) : null;
  const forecast = [
    ...factPts.map((_, i) => (forePts.length && i === factPts.length - 1 ? lastFact : null)),
    ...forePts.map(p => round2(p.amount)),
  ] as number[];

  return {
    series: { categories, fact, forecast },
    forecastTotal: round2(dto?.forecastTurnover ?? 0),
    actualTotal: round2(dto?.actualTurnover ?? 0),
    unit: CURRENCY,
  };
}
