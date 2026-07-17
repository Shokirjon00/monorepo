export interface ILogin {
  fullName: string;
  accessToken: string;
  refreshToken: string;
  passwordExpired?: boolean;
  tempToken?: string;
  permissions?: string[];
}

export interface ILoginForm {
  username: string;
  password: string;
}
