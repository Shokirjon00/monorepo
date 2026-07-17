import { IAction } from "@shared/components/actions/actions.interface";
import { ActionEnum } from "@core/enums/action-enum";

export class CompanyInfoConstants {

  static getAction(companyId: string): IAction[] {
    return [
      {
        code: ActionEnum.COMPANY_IFT_SYNC,
        tooltipName: 'Синхронизация с IFT',
        name: 'Синхронизация с IFT',
        permissionName: 'EQMSCompanySync'
      },
      {
        code: ActionEnum.OPEN_DIALOG,
        dialogName: 'telegram-notification',
        icon: 'assets/icons/share.svg',
        tooltipName: 'Подключения телеграм',
        name:'Подключения телеграм',
        permissionName: 'PosSendTelegramLink'
      },
      {
        code: ActionEnum.EDIT,
        path: `clients/company/${companyId}/edit`,
        tooltipName: 'Редактировать организацию',
        name: 'Редактировать',
        permissionName: 'CompanyUpdate'
      }
    ]
  }
}
