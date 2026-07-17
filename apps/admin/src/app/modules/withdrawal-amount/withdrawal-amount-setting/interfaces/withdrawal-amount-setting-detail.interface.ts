export interface IWithdrawalAmountSettingDetail{
  id?: string;
  companyId?: string;
  companyName?: string;
  merchants: IMerchants[];
  statusName?: string;
  isActive?: boolean;
}

export interface IMerchants{
  merchantId?: string;
  name?: string;
  issueMoneyPeriodTypeId?: string;
  issueMoneyPeriodTypeName?: string;
  runAt?: string;
  finishAt?: string;
  statusName?: string;
  isActive?: boolean;
}
