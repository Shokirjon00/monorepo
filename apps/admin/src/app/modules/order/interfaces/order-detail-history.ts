export interface IOrderDetailHistory {
  id: string;
  invoiceId: string;
  paymentId: string;
  extPaymentSessionNumber: string;
  posName: string;
  amount: number;
  orderStatusName: string;
  paymentCreatedAt: string;
  items:  IOrderDetailHistoryItem[];
}

export interface IOrderDetailHistoryItem {
  name: string;
  price: number;
  quantity: number;
  unit: string;
}
