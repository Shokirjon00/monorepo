export interface IClientRole{
  id?: string;
  name: string;
  description: string;
  createdAt?: string;
  modifiedAt?: string;
  isActive: boolean;
  statusName: string;
  permissions?: string[];
}
