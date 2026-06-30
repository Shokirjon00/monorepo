export interface ICashbackLimitDetail{
  name: string;
  limitParamJson: LimitParamJson;
  isActive: boolean;
}

interface LimitParamJson{
  amount: string;
  cashbackLimitTypeId: string;
}
