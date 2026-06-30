import { IAction } from "@shared/components/actions/actions.interface";
import { ActionEnum } from "@core/enums/action-enum";

export class MerchantInfoConstants {

  static getAction(companyId: string, merchantId: string): IAction[] {
    return [
      {
        code: ActionEnum.OPEN_DIALOG,
        dialogName: 'migration',
        icon: './assets/icons/arrow-swap.svg',
        tooltipName: 'Запустить миграцию',
        permissionName: 'MerchantMigrateForNewIssueMoney'
      },
      {
        code: ActionEnum.EDIT,
        tooltipName: 'Редактировать торговую точку',
        path: `clients/company/${companyId}/merchant/${merchantId}/edit`,
        permissionName: 'MerchantUpdate'
      }
    ]
  }

  static getActionMerchant(merchantId: string): IAction[] {
    return [
      {
        code: ActionEnum.OPEN_DIALOG,
        dialogName: 'migration',
        icon: './assets/icons/arrow-swap.svg',
        tooltipName: 'Запустить миграцию',
        permissionName: 'MerchantMigrateForNewIssueMoney'
      },
      {
        code: ActionEnum.EDIT,
        tooltipName: 'Редактировать торговую точку',
        path: `clients/merchant/${merchantId}/edit`,
        permissionName: 'MerchantUpdate'
      }
    ]
  }
}
