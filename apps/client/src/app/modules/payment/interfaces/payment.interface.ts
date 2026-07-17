export interface IPayment {
  id: string;
  createdAt: string;
  finishedAt: string;
  merchantName: string;
  posName: string;
  cityName: string;
  address: string;
  posTypeName: string;
  operationName: string;
  number: string;
  accountTypeName: string;
  extAccountNumber: string;
  fromAmount: string;
  amount: string;
  fromCurrencyName: string;
  toCurrencyName: string;
  paymentStatusGroupName: string;
  paymentStatusGroupId: string;
  params: string;
  commission: string;
  acquiringCommission: string;
  merchantCashback: string;
  bankCashback: string;
  bankEmitentName: string;
  userFullName: string;
  userMsisdn: string;
  toPay: string;
  commissionAmount: number;
  merchantCashbackAmount: number;
  toPayAmount: number;
  serviceName: string;
  isCompleted?: boolean;
  isRefunded?: boolean;
  isActive?: boolean;
  fromCurrencyIso: string;
  [key: string]: any;
}

export interface IPayments {
  payments: IPayment[];
  paymentStatusAmounts: IPaymentStatusAmount[];
}

export interface IPaymentStatusAmount {
  amount: number;
  count: number;
  statusName: string;
  statusType: string;
  currencies: Currencies[];
}

export interface Currencies {
  currencyName: number;
  count: number;
  amount: string;
}
