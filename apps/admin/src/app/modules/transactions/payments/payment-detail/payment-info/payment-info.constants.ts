import { ActionEnum } from "@core/enums/action-enum";

export class PaymentsInfoConstants {

  static getActions (paymentId: string): any {
    return [
      {
        code: ActionEnum.UNLOCK_PAYMENT,
        tooltipName: 'Разблокировка платежа',
        permissionName: 'UnlockPayment'
      },
      {
        code: ActionEnum.REFUND_PAYMENT,
        tooltipName: 'Возврат платежа',
        permissionName: 'PaymentCancel'
      },
      {
        code: ActionEnum.SYNC_PAYMENT_INFO,
        tooltipName: 'Синхронизация статуса',
        permissionName: 'PaymentContinueProcess'
      },
      {
        code: ActionEnum.EDIT,
        tooltipName: 'Редактировать',
        path: `transactions/payments/${paymentId}/edit`,
        queryParams: { paymentMode: 'info' }
      },
    ]
  }
}
