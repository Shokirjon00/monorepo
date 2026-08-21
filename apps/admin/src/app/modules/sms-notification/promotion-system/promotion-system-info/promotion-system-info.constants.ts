import { ActionEnum } from '@eskhata/util';

export class PromotionSystemInfoConstants {

  static getActions (notificationId: string): any {
    return [
      {
        code: ActionEnum.EDIT,
        tooltipName: 'Редактировать',
        path: `/promotion-system/list/edit/${notificationId}`,
        permissionName: 'SystemNotificationsUpdate'
      },
    ]
  }
}
