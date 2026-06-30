export interface IMailing {
  id: string;
  name: string;
  companyName: string;
  companyId: string;
  createdByName: string;
  periodTypeName: string;
  statusName: string;
  isActive: boolean;
  runAt?: string;
  lastRunAt?: string;
  actionTypeName?: string;
  merchantsName?: string;
  posesName?: string;
  paymentStatusesName?: string;
}

export interface IMailingUpdate {
  actionTypeId: string;
  id: string;
  isActive: boolean;
  isArchived: boolean;
  mailingRecipient: {
    companyId: string;
    isSendCompany: boolean;
    isSendMerchant: boolean;
    isSendPos: boolean;
    merchantsId: string[];
    posesId: string[];
  }
  name: string;
  paymentStatusesId: string[];
  periodTypeId: string;
  runAt: string;
}
