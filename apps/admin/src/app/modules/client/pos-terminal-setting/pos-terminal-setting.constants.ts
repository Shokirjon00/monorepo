import { IAction } from "@shared/components/actions/actions.interface";
import { ActionEnum } from "@core/enums/action-enum";

export class PosTerminalSettingConstants {

  static readonly POS_TERMINAL_SETTING_ACTION: IAction[] = [
    {
      code: ActionEnum.OPEN_DIALOG,
      dialogName: 'merchant-dialog',
      icon: '/assets/icons/save.svg',
      tooltipName: 'Сохранить настройки',
      name: 'Сохранить',
      permissionName: 'MerchantComponentUpdate'
    },
  ]
}
