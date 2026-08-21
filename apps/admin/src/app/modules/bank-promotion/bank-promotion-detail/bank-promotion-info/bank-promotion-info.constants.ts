import { ActionEnum } from '@eskhata/util';

export class BankPromotionInfoConstants {

  static getActions (bankPromotionId: string): any {
    return [
      {
        code: ActionEnum.EDIT,
        tooltipName: 'Редактировать',
        path: `/bank-promotion/${bankPromotionId}/edit`,
        permissionName: 'CashbackPromotionUpdate'
      },
    ]
  }
}
