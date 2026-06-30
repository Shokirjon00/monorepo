export interface IPayment {
  id: string;
  companyId: string;
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
  toAmount: string;
  fromCurrencyName: string;
  toCurrencyName: string;
  paymentStatusGroupName: string;
  paymentStatusAmounts: any;
  paymentStatusGroupId: string;
  parentID: string;
  commission: string;
  acquiringCommission: string;
  merchantCashback: string;
  bankCashback: string;
  toPay: string;
  isCompleted?: boolean;
  isRefunded?: boolean;
  sessionNumber?: string;
  isActive?: boolean;
  posExtCodeEqms: string;
  companyName: string;
  inn: number;
  createdByName: string;
  fromAccountNumber: number;
  toAccountNumber: number;
  serviceName: string;
  bankEmitentName: string;
  bankAcquirerName: string;
  params: string;
  userMsisdn: string;
  fromGatewayName: string;
  toGatewayName: string;
  paymentStatusName: string;
  paymentSyncStatusName: string;
  modifiedAt: string;
  modifiedByName: string;
}

export interface ITransaction {
  payments: IPayment[];
  paymentStatusAmounts: IPaymentStatusAmount[];
}

export interface IPaymentStatusAmount {
  amount: number;
  count?: number;
  statusName: string;
  statusType: string;
  currencies: Currencies[];
}

export interface Currencies {
  currencyName: number;
  count: number;
  amount: string;
}
