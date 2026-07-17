export interface IPaymentStatus {
  id: string;
  name: string;
  createdAt: string;
  modifiedAt: string;
  createdByName: string;
  modifiedByName: string;
  statusName: string;
  isActive: boolean;
  type: string;
  code: string;
}
