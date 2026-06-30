export interface IOrder {
  createdAt: string;
  id: string;
  invoiceId: string;
  orderTypeName: boolean;
  merchantName: string;
  orderAmount: number;
  orderId: string;
  orderStatusName: string;
  paymentAmount: number;
  posName: string;
  description: string;
  paymentNumber: number;
}
