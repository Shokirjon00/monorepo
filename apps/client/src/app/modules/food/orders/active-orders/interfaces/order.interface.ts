export type OrderStatusName =
  | 'NEW'
  | 'PAYED'
  | 'CONFIRMED'
  | 'ACCEPTED'
  | 'READY'
  | 'DELIVERING'
  | 'COMPLETED'
  | 'CANCELED'
  | 'CANCEL_IN_PROCESS';

export type OrderStatusGroupName =
  | 'NEW'
  | 'IN_PROCESS'
  | 'COMPLETED'
  | 'CANCELED';

export interface IOrder {
  id: string;
  sequence: number;
  restaurantPointName: string;
  createdByUser: string;
  username: string;
  deliveryAddress?: string;
  paymentMethodName: string;
  totalPrice: IOrderPrice;
  price: IOrderPrice;
  deliveryPrice: IOrderPrice;
  discountPrice: IOrderPrice;
  orderStatus: {
    name: OrderStatusName;
    value: string;
  };
  orderStatusGroup: {
    name: OrderStatusGroupName;
    value: string;
  };
  comment?: string;
  createdDateTime: string;

  items: IOrderItem[];
}

export interface IOrderItem {
  id?: string;
  productName: string;
  image?: string;
  productVariantId?: string;
  dimensionUnitName?: string;
  dimensionValue?: number;

  quantity: number;

  price: {
    amount: number;
    currencyCode: string;
  };
}

export interface IOrderPrice {
  amount: number;
  currencyCode: string;
}

export interface OrderActionButton {
  condition: (o: any) => boolean;
  action: OrderAction;
  label: string | ((o: any) => string);
  class?: string;
  permissionName: string;
}

export type OrderAction = 'accept' | 'ready' | 'deliver' | 'complete' | 'cancel';
