export interface IPaymentStatusDetail {
  id: string,
  code: string,
  name: string,
  isActive?: boolean;
  statusName?:string;
  type: string,
}
