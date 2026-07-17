export interface IHistoryInfoInterface {
  restaurantPointName: string;
  sequence: number;
  username: string;
  paymentMethodName: string;
  createdByUser: string;
  orderStatus: {
    name: string;
    value: string;
  }
  totalPrice: {
    amount: number;
    currencyCode: string;
  };
  createdDateTime: string;
  id: string;
  deliveryAddress: string;
  deliveryTypeName: string;
  comment: string;
  items: Items[];
}

interface Items {
  id: string;
  productName: string;
  productVariantName: string;
  dimensionUnitName: string;
  dimensionValue: number;
  quantity: number;
  price: {
    amount: number;
    currencyCode: string;
  }
}
