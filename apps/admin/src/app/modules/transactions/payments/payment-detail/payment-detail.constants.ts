import { ITab } from '@eskhata/util';

export class PaymentsDetailConstants {
  static getHeaderTabs(paymentId: string): ITab[] {
    return [
      {
        label: 'История платежа',
        path: `/transactions/payments/${paymentId}/payment-history`,
        permissionName: 'PaymentHistoryList',
      },
      {
        label: 'Дочерние платежи',
        path: `/transactions/payments/${paymentId}/payment-childs`,
        permissionName: 'PaymentChildList',
      },
      {
        label: 'Информация о платеже',
        path: `/transactions/payments/${paymentId}/payment-info`,
        permissionName: 'PaymentDetail',
      },
    ];
  }
}
