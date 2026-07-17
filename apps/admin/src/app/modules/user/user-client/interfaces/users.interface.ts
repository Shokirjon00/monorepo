export interface IUsers {
  id: string;
  userName: string;
  roleName: string;
  fullName?: string;
  phoneNumber: string;
  email: string;
  branchName: string;
  createdAt: string;
  firstName?: string;
  lastName?: string;
  middleName?: string;
  companyId: string;
  lastLoginDateTime?: string;
  isShowSendFirstLoginData?: boolean;
  isShowResetPassword?: boolean;
  statusName: string;
  isActive: boolean;
  merchants:string[];
  merchant: {
    ids: string[];
    selectedAll: boolean;
  };
  poses: string[];
  pos: {
    ids: string[];
    selectedAll: boolean;
  },
  loginFailedAttempts?: string,
  lockoutDateTime?: string;
  lockoutEndDateTime?: string;
  lastPasswordChangeDateTime?: string;
  passwordExpireDateTime?: string;
  companyName?: string;
}
