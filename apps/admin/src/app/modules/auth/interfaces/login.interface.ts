export interface ILogin {
  fullName: string;
  accessToken: string;
  refreshToken: string;
  passwordExpired?: boolean;
  permissions?: string[];
}
export interface ILoginForm {
  username: string;
  password: string
}
