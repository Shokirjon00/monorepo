export interface IMerchant {
  passiveAccountNumber : string;
  activeAccountNumber  : string;
  branchName: string;
  cityName: string;
  commission?: string;
  companyId: string;
  companyName: string;
  id: string;
  name: string;
  posCount: number;
  registrationDate: string;
  status?: string;
  isActive: boolean;
  isSelected?: boolean;
}
