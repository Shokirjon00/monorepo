export interface IHistoryOrders {
  restaurantPointName: string;
  sequence: number;
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
}
