export interface IUserAdmin {
  id: string;
  userName: string;
  firstName?: string;
  lastName?: string;
  middleName?: string;
  fullName?: string;
  roleName: string;
  email: string;
  createdAt: string;
  modifiedAt: string;
  statusName: string;
  isActive: boolean;
  lastLoginDateTime?: string;
  isShowSendFirstLoginData?: boolean;
  isShowResetPassword?: boolean;
  roles?: [],
  branches?: [],
}
