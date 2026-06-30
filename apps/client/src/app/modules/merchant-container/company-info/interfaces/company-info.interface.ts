export interface ICompanyInfo {
  id?: string;
  inn: string;
  extCodeAbs: string;
  extCodeEqms?: string;
  name: string;
  companyLegalFormId?: string;
  companyLegalFormName?: string;
  branchName?: string;
  countryId?: string;
  countryName?: string;
  regionId?: string;
  regionName?: string;
  areaId?: string;
  areaName?: string;
  cityId?: string;
  cityName?: string;
  address: string;
  referName: string;
  companySegmentName?: string;
  contractVirtualFile?: string;
  contractTemplateVirtualFile?: string
  branchId?: string;
  companySegmentId?: string;
  responsibleBankEmployeeId?: string;
  responsibleBankEmployeeName?: string;
  contractFileId?: string
  companyLimitId?: string;
  isActive: boolean;
  statusName: string;
  [key: string]: any;
}
