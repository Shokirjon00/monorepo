export interface IWithdrawalAmount {
  id: string;
  createdAt: string;
  issueStartAt: Date;
  issueEndAt: Date;
  companyName: string;
  status: string;
  merchantName: string;
  period: string;
  amount: number;
  issueMoneyRegistriesMerchantsCount: number;
}
