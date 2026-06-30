import { ActionEnum } from "@core/enums/action-enum";

export class PaymentsHistoryConstants {

  static getActions(paymentId: string): any {
    return [
      {
        code: ActionEnum.REFUND_PAYMENT,
        tooltipName: 'Возврат платежа',
        permissionName: 'PaymentCancel',
      },
      {
        code: ActionEnum.EDIT,
        tooltipName: 'Редактировать',
        path: `transactions/payments/${paymentId}/edit`,
        queryParams: { paymentMode: 'history' }
      },
    ]
  }
}
