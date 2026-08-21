export interface ICommissionCompany {
  commissionName: string,
  bankCommissionNames: ICommissionBank[],
  startDate: string,
  endDate: string,
  commissionTypeName: string,
  companyName: string,
  createdAt: string,
  modifiedAt: string,
  createdByName: string,
  modifiedByName: string,
  id: string,
  statusName: boolean,
  isActive: boolean,
  description: string,
  eWalletCommissionCancelled: string,
  merchants: IMerchants[]
}

interface ICommissionBank {
  bankName: string,
  commissionName: string
}

interface IMerchants {
  name: string
}

export interface ICommissionCompanyEdit {
  bankCommissions: any[];
  id: string,
  commissionId: string,
  companyId: string,
  startDate: string,
  endDate: string,
  commissionTypeId: string,
  description: string,
  isActive: boolean,
  canUpdate: boolean,
  isEWalletCommissionCancelled: boolean,
  merchants: string[],
  isFullyEditable: boolean
}
