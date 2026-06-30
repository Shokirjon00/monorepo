export interface IMerchantDetail {
  id?:string;
  name: string;
  companyId?: string;
  extCodeEqms?: string;
  companyName: string;
  regionId: string;
  regionName: string;
  areaId: string;
  areaName: string;
  cityId?: string;
  cityName: string;
  countryId: string;
  address: string;
  phoneNumber: string;
  email: string;
  managerName: string;
  managerPhoneNumber: string;
  branchName: string;
  commissionId?: string;
  commissionName?: string;
  categoryId?: string;
  categoryName?: string;
  subCategoryId?: string;
  subCategoryName?: string;
  merchantWorkDayId?: string;
  workDayName: string;
  paymentAccountId?: string;
  paymentAccountName?: string;
  paymentAccountNumber?: string;
  paymentCardAccountId?: string;
  paymentCardAccountName?: string;
  position: string;
  latitude?: number;
  longitude?: number;
  description: string;
  isActive: boolean
  statusName?: string;
  isVerified: boolean;
  isShowOnMain?: boolean;
  imgLoginMain?: string;
  imgLogoList?: string;
  imgLogoDetail?: string;
  lastIssueAt: string;
  merchantIntegrationJsons: [];
  merchantContactJson?: MerchantContactJson;
  verifiedName: string;
}

interface MerchantContactJson{
  phoneNumber: string;
  email: string;
  managerName: string;
  managerPhoneNumber: string
}
