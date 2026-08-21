import { ActionEnum } from '@eskhata/util';

export class AllowListConstants {

  static getActions (id: string): any {
    return [
      {
        code: ActionEnum.EDIT,
        tooltipName: 'Редактировать',
        path: `/advance/allow-list/edit/${id}`,
        permissionName: 'AdvancePayoutOfferUpdate'
      },
    ]
  }
}
