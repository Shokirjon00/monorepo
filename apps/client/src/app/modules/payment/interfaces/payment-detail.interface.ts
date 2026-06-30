export interface IPaymentDetail {
  createdAt: string,
  finishedAt: string,
  merchantName: string,
  posName: string,
  posTypeName: string,
  extUserMsisdn: string,
  amount: string,
  commission: string,
  merchant: string,
  paymentStatusGroupName: string,
  table: {
    startDate: string,
    endDate: string,
    status: string,
    user: string,
    comment: string
  }
}
