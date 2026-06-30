import {
    ApexChart,
    ApexFill,
    ApexStroke,
    ApexTooltip
} from 'ng-apexcharts';
import { QrPosChannel } from "@core/enums/qr-pos-enum";

export interface IQrPosFilter {
    dateFilterTypeId?: string;
    startDate?: string;
    endDate?: string;
    companyId?: string;
    merchantId?: string;
    posId?: string;
    channel: QrPosChannel;
    statusId?: string;
    regionId?: string;
    currencyId?: string;
}

export interface IQrPosMetricCard {
    key: string;
    title: string;
    value: number;
    unit?: string;
    deltaPercent?: number;
    comparisonValue?: number;
    comparisonUnit?: string;
    trend?: number[];
    gauge?: { percent: number; color?: string };
    color?: string;
    colorKey?: string;
    icon?: string;
    growthIsPositive?: boolean;
}

export interface IQrPosChartSeries {
    name: string;
    data: number[];
    color?: string;
    dashed?: boolean;
}

export interface IQrPosChartData {
    type: 'bar' | 'line' | 'area';
    categories: string[];
    series: IQrPosChartSeries[];
    horizontal?: boolean;
    colors?: string[];
    gradient?: boolean;
    dataLabels?: boolean;
}

export interface IQrPosDynamics {
    categories: string[];
    fact: number[];
    plan: number[];
}

export interface IQrPosPlanFactForecast {
    fact: number;
    plan: number;
    forecast: number;
    currency?: string;
    year?: number;
    quarter?: number;
}

export interface IQrPosAcquiringItem {
    key: string;
    label: string;
    value: number;
    percent: number;
    color?: string;
}

export interface IQrPosAcquiringStructure {
    total: number;
    currency?: string;
    items: IQrPosAcquiringItem[];
}

export interface IQrPosRegion {
    regionId: string;
    name: string;
    turnover: number;
    share: number;
    lat?: number;
    lng?: number;
}

export interface IQrPosGeography {
    total: number;
    currency?: string;
    regions: IQrPosRegion[];
}

export interface IQrPosAnalyticsData {
    cards: IQrPosMetricCard[];
    dynamics: IQrPosDynamics;
    planFactForecast: IQrPosPlanFactForecast;
    acquiring: IQrPosAcquiringStructure;
    geography: IQrPosGeography;
}

export interface IQrPosQuarterPlan {
    year: number;
    quarter: number;
    planAmount: number;
    activeMerchantsPlan: number;
}

export interface IQrPosServerSettings {
    inactivityDays: number;
    plans: IQrPosQuarterPlan[];
}

export interface ISparklineOptions {
    series: { name: string; data: number[] }[];
    chart: ApexChart;
    stroke: ApexStroke;
    fill: ApexFill;
    colors: string[];
    tooltip: ApexTooltip;
}

export interface IRegionMarker {
    regionId: string;
    name: string;
    x: number;
    y: number;
    size: number;
}

export interface IPlanFactRow {
    key: 'fact' | 'plan' | 'forecast';
    label: string;
    value: number;
    heightPercent: number;
}
