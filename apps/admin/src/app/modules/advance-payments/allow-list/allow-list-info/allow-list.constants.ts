import { ActionEnum } from "@core/enums/action-enum";

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
