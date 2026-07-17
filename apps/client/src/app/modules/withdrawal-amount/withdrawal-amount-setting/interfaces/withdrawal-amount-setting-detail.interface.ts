export interface IWithdrawalAmountSettingDetail{
  id?:string;
  merchants: IMerchants[];
  isActive?: boolean;
}

export interface IMerchants{
  merchantId?: string;
  merchantName?: string;
  issueMoneyPeriodTypeId?: string;
  runAt?: string;
  isActive?: boolean;
}
