import { IAction } from '@eskhata/util';
import { ActionEnum } from '@eskhata/util';

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
