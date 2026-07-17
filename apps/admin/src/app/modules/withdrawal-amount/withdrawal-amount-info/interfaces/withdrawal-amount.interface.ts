export interface IWithdrawalAmount {
  id: string;
  createdAt: Date;
  period: Date;
  issueEndAt: Date;
  companyName: string;
  companyId: string;
  status: string;
  isSchedulerName: string;
  issueMoneyRegistriesMerchantsCount: number;
}
