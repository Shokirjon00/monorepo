import { ITab } from "@core/interfaces/header.interface";
import { ActionEnum } from "@core/enums/action-enum";
import {IAction} from "@shared/components/actions/actions.interface";

export class RetailOutletDetailConstants {

  static getHeaderTabs(id: string): ITab[] {
    return [
      {
        label: 'Информация',
        path: `/company-registration-applications/retail-outlet/detail/${id}/retail-outlet-info`,
        permissionName: '',
      },
      {
        label: 'История',
        path: `/company-registration-applications/retail-outlet/detail/${id}/retail-outlet-history`,
        permissionName: '',
      },
    ]
  }

  static readonly ACTIONS: IAction[] = [
    {
      code: ActionEnum.ADD,
      tooltipName: 'Добавить торговую точку',
      path: 'directory/country/new',
      permissionName: ''
    },
    {
      code: ActionEnum.STATUS_APPLICATION,
      dialogName: 'status-application',
      tooltipName: 'Изменить статус заявки',
      name: 'Изменить статус заявки',
    },
  ];
}
