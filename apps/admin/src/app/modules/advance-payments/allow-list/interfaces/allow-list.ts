export interface IAllowList {
  id: string;
  companyName: string;
  amount: number;
  createdAt: Date;
  modifiedAt?: Date;
  statusName: string;
  isActive: boolean;
  companyId: string;
}
