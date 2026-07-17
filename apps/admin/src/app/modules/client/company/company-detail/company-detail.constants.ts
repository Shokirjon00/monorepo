import { IAction } from "@shared/components/actions/actions.interface";
import { ActionEnum } from "@core/enums/action-enum";

export class CompanyDetailsConstants {

  static getAction(companyId: string): IAction[] {
    return [
      {
        code: ActionEnum.ADD,
        path: `clients/company/${companyId}/merchant/new`,
        tooltipName: 'Новая точка продаж'
      },
      {
        code: ActionEnum.ADD,
        path: `clients/company/${companyId}/cashback/new`,
        icon: './assets/icons/percent.svg',
        tooltipName: 'Новый кэшбэк',
        permissionName: 'CashbackCompanyCreate'
      },
      {
        code: ActionEnum.EDIT,
        path: `clients/company/${companyId}/edit`,
        tooltipName: 'Редактировать организацию'
      },
    ];
  }
}
