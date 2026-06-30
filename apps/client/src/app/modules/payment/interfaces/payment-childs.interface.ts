export interface IPaymentChilds{
  id: string;
  createdAt: string;
  finishedAt: string;
  merchantName: string;
  posName: string;
  cityName: string;
  address: string;
  posTypeName: string;
  operationName: string;
  number: number;
  accountTypeName: string;
  extAccountNumber: string;
  fromAmount: string;
  toAmount: string;
  fromCurrencyName: string;
  toCurrencyName: string;
  paymentStatusGroupName: string;
  commission: string;
  acquiringCommission: string;
  merchantCashback: string;
  bankCashback: string;
  toPay: string;
}
