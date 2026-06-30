export interface IUsers {
  id: string;
  userName: string;
  posTerminalUserName: string;
  roleName: string;
  fullName?: string;
  phoneNumber: string;
  email: string;
  branchName: string;
  createdAt: string;
  firstName?: string;
  lastName?: string;
  middleName?: string;
  lastLoginDateTime?: string;
  isShowSendFirstLoginData?: boolean;
  isShowResetPassword?: boolean;
  statusName: string;
  isActive: boolean;
  merchants: [];
  poses: []
  roles: string[];
}
