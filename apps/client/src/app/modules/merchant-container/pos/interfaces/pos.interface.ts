export interface IPos {
  codeMap: string;
  createdDateTime: string;
  updatedDateTime: string;
  id: string;
  fullName: string;
  name: string;
  internationalName: string;
  address: string;
  inn: string;
  ein: string;
  isActive: string;
  statusName: string;
  merchantName: string;
  posTypeName: string;
  createdAt?: string;
  modifiedAt?: string;
}

export interface IPosDetail {
  id: string;
  name: string;
  address?: string;
  companyName?: string;
  merchantId?: string;
  merchantName?: string;
  extCodeEqms?: string;
  posTypeId?: string;
  posTypeName?: string;
  integrationTypeId?: string;
  integrationTypeName?: string;
  statusName?: string;
  isActive: boolean;
  posContactJson: PosContactJson;
  isShowPosSetting: boolean;
}
interface PosContactJson {
  cashierName: string;
  emails: string[];
  smsPhoneNumbers: string[];
  eqmsPhoneNumber?: string;
}

