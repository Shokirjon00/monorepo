import { ActionEnum } from '@eskhata/util';

export class SettingInfoConstants {

  static getActions (id: string): any {
    return [
      {
        code: ActionEnum.EDIT,
        tooltipName: 'Редактировать',
        path: `/setting/system/edit/${id}`,
        permissionName: 'SystemNotificationsUpdate'
      },
    ]
  }
}
