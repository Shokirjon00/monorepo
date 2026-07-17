export interface IAllowListDetail {
  id: string;
  companyId: string;
  advancePayoutAccountId: string;
  advanceRepaymentAccountId: string;
  contractInfo: string;
  amount: number;
  commissionId: string;
  isActive: boolean;
  isCompanyEditable: boolean;
  fileStorageUrl: string;
  fileStorageToken: string;
}
