export interface IDeliveryMethods {
  deliveryTypeId: string;
  name: string;
  isActive: boolean;
  price?: IPrice;
}

interface IPrice {
  amount: number;
  currencyCode: string;
}
