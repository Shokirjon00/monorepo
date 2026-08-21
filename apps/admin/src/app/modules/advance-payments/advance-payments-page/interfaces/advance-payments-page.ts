export interface IAdvancePaymentsPage {
  id: string;
  statusName: string;
  statusId: number;
  companyId: string;
  companyName: string;
  issuePaymentAmount: string;
  amountRemain: string;
  expiredDays: number;
}

export interface IAdvance {
  advancePayouts: IAdvancePaymentsPage[];
  advancePayoutsStatusAmounts: IAdvancePayoutsStatusAmounts[];
}

export interface IAdvancePayoutsStatusAmounts {
  amount: number;
  count?: number;
  statusCode: string;
  statusName: string;
}
