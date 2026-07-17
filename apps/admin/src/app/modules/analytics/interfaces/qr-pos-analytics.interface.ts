import {IQrPosQuarterPlan} from "@modules/analytics/qr-pos-analytics/interfaces/qr-pos-analytics.interface";

export interface IMetricDeltaInterface {
  current: number;
  previous: number;
  delta: number;
  deltaPercent?: number;
}

export interface ISummaryCardsInterface {
  turnover: IMetricDeltaInterface;
  transactionCount: IMetricDeltaInterface;
  averageCheck: IMetricDeltaInterface;
  successRate: IMetricDeltaInterface;
  refundCancelAmount: IMetricDeltaInterface;
}

export interface ITurnoverPointInterface { date: string; amount: number; }
export interface ITurnoverDynamicsInterface {
  currentPeriod: ITurnoverPointInterface[];
  previousPeriod: ITurnoverPointInterface[];
}

export interface IPlanFactForecastInterface {
  year: number; quarter: number; plan: number; fact: number; forecast: number;
}

export interface IByServiceTypeInterface {
  qrAmount: number; posAmount: number; totalAmount: number; qrPercent: number; posPercent: number;
}

export interface IRegionInterface {
  regionId: string; regionName: string; amount: number; sharePercent: number;
}

export interface IMerchantsActivityCardsInterface {
  totalMerchants: IMetricDeltaInterface;
  activeMerchants: IMetricDeltaInterface;
  inactiveMerchants: IMetricDeltaInterface;
  conversionPercent: number;
  previousConversionPercent: number;
  merchantsWithoutTransactions: number;
  inactivityDays: number;
}

export interface IActivityPointInterface { date: string; activeMerchantCount: number; }
export interface IMerchantsActivityDynamicsInterface {
  currentPeriod: IActivityPointInterface[];
  previousPeriod: IActivityPointInterface[];
}

export interface IMerchantRankInterface {
  merchantId: string; merchantName: string; amount: number; sharePercent: number;
}

export interface IMerchantWithoutTxInterface {
  merchantId: string;
  merchantName: string;
  daysWithoutTransactions: number;
}

export interface IParkCardsInterface {
  totalPoses: IMetricDeltaInterface;
  activePoses: IMetricDeltaInterface;
  inactivePoses: IMetricDeltaInterface;
  efficiencyPercent: number;
  previousEfficiencyPercent: number;
  averageTurnoverPerDevice: number;
  previousAverageTurnoverPerDevice: number;
}

export interface IForecastPointInterface { date: string; amount: number; }
export interface IForecastTurnoverInterface {
  startDate: string;
  endDate: string;
  isForecastAvailable: boolean;
  actualTurnover: number;
  forecastTurnover: number;
  fact: IForecastPointInterface[];
  forecast: IForecastPointInterface[];
}

export interface IAnalyticsSettings {
  inactivityDays: number;
  plans: IQrPosQuarterPlan[];
}
