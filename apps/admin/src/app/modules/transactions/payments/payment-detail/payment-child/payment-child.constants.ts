import { ActionEnum } from '@eskhata/util';
import { IAction } from '@eskhata/util';

export class PaymentsChildConstants {

  static readonly PAYMENT_CHILD_ACTIONS: IAction[] = [
    {
      code: ActionEnum.REFUND_PAYMENT,
      tooltipName: 'Возврат платежа',
      permissionName: 'PaymentCancel'
    },
    {
      code: ActionEnum.CONTINUE_PAYMENT,
      tooltipName: 'Продолжение платежа',
      permissionName: 'PaymentContinueProcess'
    },
    {
      code: ActionEnum.ISSUE_MONEY,
      tooltipName: 'Вывод средств',
      permissionName: 'PaymentUpdate'
    },

    {
      code: ActionEnum.SYNC_PAYMENT,
      tooltipName: 'Синхронизация статуса',
      permissionName: 'PaymentContinueProcess'
    },
  ]
}
