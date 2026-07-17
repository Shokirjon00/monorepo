export interface IUserLog {
  id: string;
  ip: string;
  userAgent: string;
  fullName: string;
  middleName: string;
  adminUserActivityTypeName?: string;
  userActivityTypeName?: string;
  createdAt: string;
}
