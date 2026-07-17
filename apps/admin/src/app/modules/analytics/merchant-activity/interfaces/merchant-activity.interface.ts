export interface IGauge {
  percent: number;
  color?: string;
}

export interface IMetricCard {
  key: string;
  title: string;
  value: number;
  unit?: string;
  deltaPercent?: number;
  comparisonValue?: number;
  comparisonUnit?: string;
  growthIsPositive?: boolean;
  gauge?: IGauge;
}

export interface ITimeSeries {
  categories: string[];
  fact: number[];
  plan?: number[];
  forecast?: number[];
}

export interface IPlanFactForecast {
  fact: number;
  plan: number;
  forecast: number;
  unit?: string;
}

export interface IRankItem {
  rank: number;
  name: string;
  value: number;
  secondary?: number;
  percent?: number;
  color?: string;
}

export interface IErrorItem {
  code: string;
  description: string;
  count: number;
}

export interface IMerchantActivity {
  cards: IMetricCard[];
  dynamics: ITimeSeries;
  planFactForecast: IPlanFactForecast;
  topByTurnover: IRankItem[];
  noTransactions: IRankItem[];
}

export interface ITerminalPark {
  cards: IMetricCard[];
  topByTurnover: IRankItem[];
  errors: IErrorItem[];
}

export interface ITurnoverForecast {
  series: ITimeSeries;
  forecastTotal: number;
  actualTotal: number;
  unit?: string;
}

export interface IMerchantActivityData {
  merchants: IMerchantActivity;
  pos: ITerminalPark;
  qr: ITerminalPark;
  forecast: ITurnoverForecast;
}

export type MerchantActivityBlock =
  | 'merchants-dynamics'
  | 'merchants-plan-fact'
  | 'merchants-top'
  | 'merchants-no-tx'
  | 'pos-top'
  | 'pos-errors'
  | 'qr-top'
  | 'qr-errors'
  | 'forecast';

export interface IQuickAction {
  key: string;
  label: string;
  icon: string;
  colorKey?: string;
}

export interface IMerchantActivityFilter {
  dateFilterTypeId?: string;
  companyId?: string;
  top: number;
}

export interface IMaColumn {
  key: string;
  label: string;
  align?: 'left' | 'right';
  type?: 'rank' | 'text' | 'number';
  flex?: number;
}
