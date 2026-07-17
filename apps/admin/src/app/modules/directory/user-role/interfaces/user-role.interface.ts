export interface IUserRole{
  id?: string;
  name: string;
  description: string;
  createdAt?: string;
  modifiedAt?: string;
  isActive: boolean;
  statusName: string;
  permissions?: string[];
}
