export interface IUserInfo {
  roleName: string;
  photoFileId: string;
  shortName: string;
  hasRefundApplication: boolean;
  hasMerchantApplication: boolean;
}
export interface IUserProfile {
  email: string;
  fullName: string;
  photoFileId: string;
  userName: string;
  fileStorageUrl: string;
  fileStorageToken: string;
}
