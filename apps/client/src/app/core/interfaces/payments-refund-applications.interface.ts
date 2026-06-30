export interface IPaymentRefundApplications {
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
  statusName: string;
  statusId: string;
  createdAt: string;
  modifiedAt?: string;
  createdByName?: string;
  modifiedByName?: string;
  canConfirm: boolean;
  isActive: boolean;
}
