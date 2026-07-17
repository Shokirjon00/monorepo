export interface IWithdrawalAmount {
  id: string;
  period: string;
  createdAt: string;
  startPeriod?: string;
  endPeriod?: string;
  merchantName: string;
  amount: number;
  statusName?: string;
  statusId?: string;
  createdByName?: string;
  description?: string;
  isActive?: boolean;
}
