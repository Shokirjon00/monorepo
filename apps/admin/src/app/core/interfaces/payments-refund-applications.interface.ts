export interface IPaymentRefundApplications  {
  id: string;
  sendType: string;
  extId: string;
  applicationNumber: number;
  bankEmitentName: string;
  paymentId: string;
  amount: number;
  merchantName: string;
  posName: string;
  description: string;
  errorMessage: string;
  paymentRefundReason: string;
  status: string;
  statusId: string;
  createdAt: Date;
  modifiedAt?: Date;
  createdByName?: string;
  modifiedByName?: string;
  canConfirm: boolean;
}
