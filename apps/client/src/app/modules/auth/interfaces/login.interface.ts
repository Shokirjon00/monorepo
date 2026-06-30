export interface ILogin {
  fullName: string;
  accessToken: string;
  refreshToken: string;
  passwordExpired?: boolean;
  tempToken?: string;
  permissions?: string[];
}
