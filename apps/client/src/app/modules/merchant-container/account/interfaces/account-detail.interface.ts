export interface IAccountDetail{
  name: string;
  number: string;
  balance?: string;
  blockedBalance?: string;
  paramsJson?: string;
  companyId: string;
  currencyId: string;
  accountTypeId: string;
  accountStatusId?: string;
  bankId: string;
  id?: string;
  statusName?: string;
  isActive: boolean;
}
