export interface IWithdrawalSetting{
  id: string;
  merchants: SettingsMerchant[];
  isActive: boolean;
}

interface SettingsMerchant{
  id?: string;
  isActive: boolean;
  issueMoneyPeriodTypeId?: string;
  merchantId: string;
  merchantName: string;
  runAt?: string;
}
