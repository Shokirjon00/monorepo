import { IAction } from '@eskhata/util';
import { ActionEnum } from '@eskhata/util';

export class PaymentsChildInfoConstants {

  static readonly PAYMENT_CHILD_INFO_ACTIONS: IAction[] = [
    {
      code: ActionEnum.UNLOCK_PAYMENT,
      tooltipName: 'Разблокировка платежа',
      permissionName: 'UnlockPayment'
    }
  ]
}
