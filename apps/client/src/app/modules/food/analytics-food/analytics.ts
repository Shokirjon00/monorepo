import { IClientsData, IRevenues, IRevenueStatsData } from '@modules/food/analytics-food/interface/analytics.interface';

export const defaultClientsData: IClientsData = {
  allClients: { quantity: 0 },
  newClients: { quantity: 0 },
  ordersFrequency: { average: 0, series: [0, 0], labels: ['', ''] },
};

export const defaultRevenueStatsData: IRevenueStatsData = {
  revenue: { total: 0, data: [], dataTimes: [] },
  averageBill: { total: 0, data: [], dataTimes: [] },
  orders: { quantity: 0, series: [0, 0], labels: ['', ''] },
};

export const defaultRevenuesData: IRevenues = {
  totalRevenues: 0,
  actualRevenuePercentage: 0,
  lostRevenuePercentage: 0,
  series: [
    { name: 'Фактическая выручка', data: [] },
    { name: 'Упущенная выручка', data: [] },
    { name: 'Общая выручка', data: [] },
  ],
  dateTimes: [],
};
