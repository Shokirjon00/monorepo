export interface IPosDetail {
  id: string;
  extCodeEqms: number;
  terminalId?: string;
  name: string;
  address?: string;
  companyName?: string;
  merchantId?: string;
  merchantName?: string;
  posTypeId?: string;
  posTypeName?: string;
  integrationTypeId?: string;
  integrationType?: string;
  statusName?: string;
  isActive: boolean;
  posContactJson: PosContactJson;
  isShowPosSetting: boolean;
  lastSyncEqms: string;
}

interface PosContactJson{
  cashierName: string;
  emails: string[];
  smsPhoneNumbers: string[];
  eqmsPhoneNumber: string;
}
