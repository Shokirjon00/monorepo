export interface IOrderDetailHistory {
  id: string;
  createdAt: string;
  merchantName: string;
  orderAmount: number;
  description: string;
  paymentAmount: number;
  orderTypeName: string;
  paymentNumber: number;
  invoiceId: string;
  posName: string;
  orderStatusName: string;
  items: IOrderDetailHistoryItem[];
}

export interface IOrderDetailHistoryItem {
  name: string;
  price: number;
  quantity: number;
  unit: string;
}
