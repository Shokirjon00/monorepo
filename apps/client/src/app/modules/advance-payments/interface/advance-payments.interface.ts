export interface IAdvancePayments {
  id: string;
  statusName: string;
  statusId: string;
  companyName: string;
  issuePaymentAmount: number;
  amountRemain: number;
  issuedAt: string;
  expiredAt: string;
  expiredDays: number;
  settlementAt: string;
  isActive: boolean;
}
