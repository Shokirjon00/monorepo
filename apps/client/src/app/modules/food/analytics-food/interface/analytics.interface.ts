export interface IOrdersData {
  series: number[];
  labels: string[];
  quantity?: number;
}

export interface IClientsData {
  total?: number;
  new?: number;
  frequency?: {
    '1-3': number;
    '4+': number;
  };
  totalByDays?: number[];
  newByDays?: number[];
  allClients?: { quantity: number };
  newClients?: { quantity: number };
  ordersFrequency: { average: number; series: number[]; labels: string[] };
}

export interface IRevenueStatsData {
  revenue: { total: number; data: number[]; dataTimes: string[] };
  averageBill: { total: number; data: number[]; dataTimes: string[] };
  orders: IOrdersData;
}

export interface IRevenueSeries {
  name: string;
  data: number[];
}

export interface IRevenues {
  totalRevenues: number;
  actualRevenuePercentage: number;
  lostRevenuePercentage: number;
  series: IRevenueSeries[];
  dateTimes: string[];
}
