export interface IMerchantForm {
  name: string;
  companyId: string;
  cityId: string;
  address: string;
  merchantContactJson: IMerchantContact;
  frontolLoginName: string;
  transitAccountId: string;
  accountId: string;
  paymentAccountId: string;
  paymentCardAccountId: string;
  merchantWorkDayId: string;
  commissionId: string;
  categoryId: string;
  lastIssueAt: string;
  latitude: string;
  longitude: string;
  isVerified: boolean;
  imgLoginMain: string;
  imgLogoList: string;
  imgLogoDetail: string;
  position: number;
  isShowOnMain: boolean;
  description: string;
  isActive: boolean
}

interface IMerchantContact {
  phoneNumber: string;
  email: string;
  managerName: string;
  managerPhoneNumber: string
}
