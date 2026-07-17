export interface IUserInfo {
  roleName: string;
  photoFileId: string;
  shortName: string;
  hasRefundApplication: boolean;
  permissions?: string[];
}
export interface IUserProfile {
  email: string;
  fullName: string;
  photoFileId: string;
  userId: string;
  companyId: string;
  userName: string;
  fileStorageUrl: string;
  fileStorageToken: string;
}
