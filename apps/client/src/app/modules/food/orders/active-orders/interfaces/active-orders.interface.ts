import { IOrderItem } from '@modules/food/orders/active-orders/interfaces/order.interface';

export interface IOrders {
  sequence: number;
  accountNumber: string;
  branchName: string;
  cityName: string;
  commission: string;
  companyName: string;
  id: string;
  name: string;
  username: string;
  posCount: number;
  restaurantPointName: string;
  registrationDate: string;
  status: string;
  orderStatus: Status;
  orderStatusGroup: Status;
  totalPrice: Status;
  statusName: string;
  isActive: boolean;
  commissionName: string;
  createdDateTime: string;
  isIntegrated: boolean;
  deliveryTypeName: string;
}

 interface Status {
  name: string;
  value: string;
 }

interface Status {
  amount: string;
  currencyCode: string;
}

export interface IOrderRefusalReason {
  id: string;
  code: string;
  name: string;
}

export interface CancelOrderModalData {
  orderSequence?: string;
  reasons: IOrderRefusalReason[];
  items: IOrderItem[];
}

export interface CancelOrderModalResult {
  confirmed: boolean;
  reason?: IOrderRefusalReason;
  items?: IOrderItem[];
}
