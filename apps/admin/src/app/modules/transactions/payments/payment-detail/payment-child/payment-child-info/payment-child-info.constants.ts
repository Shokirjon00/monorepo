import { IAction } from "@shared/components/actions/actions.interface";
import { ActionEnum } from "@core/enums/action-enum";

export class PaymentsChildInfoConstants {

  static readonly PAYMENT_CHILD_INFO_ACTIONS: IAction[] = [
    {
      code: ActionEnum.UNLOCK_PAYMENT,
      tooltipName: 'Разблокировка платежа',
      permissionName: 'UnlockPayment'
    }
  ]
}
