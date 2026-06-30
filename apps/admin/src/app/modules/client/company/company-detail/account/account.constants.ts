import { ICaption, IRowAction } from "@core/interfaces";
import { IAction } from "@shared/components/actions/actions.interface";
import { ActionEnum } from "@core/enums/action-enum";
import { TableRowActionEnum } from "@core/enums/table";

export class AccountConstants {

  static readonly ACCOUNT_COLUMNS : ICaption[] = [
    {
      key: 'Статус',
      field: 'isActive',
      fieldSecond: 'statusName',
      type: 'status-indicator',
      filterType: 'list',
      isFiltered: false,
      isSelected: true,
      width: '155px',
    },
    {
      key: 'Наименование',
      field: 'name',
      type: 'text',
      filterType: 'text',
      isSelected: true,
      width: '200px',
    },
    {
      key: 'Номер счета',
      field: 'number',
      type: 'text',
      filterType: 'text',
      isSelected: true,
      width: '155px',
    },
    {
      key: 'Валюта',
      field: 'currencyName',
      type: 'text',
      filterType: 'text',
      isSelected: true,
      width: '155px',
    },
    {
      key: 'Банк',
      field: 'bankName',
      type: 'text',
      filterType: 'text',
      isSelected: true,
      width: '155px',
    },
    {
      key: 'Тип счета',
      field: 'accountTypeName',
      type: 'text',
      filterType: 'text',
      isSelected: true,
      width: '155px',
    },
    {
      key: 'ИНН',
      field: 'inn',
      type: 'text',
      isSelected: true,
      isSortable: true,
      width: '100px',
    },
    {
      key: 'ФИО',
      field: 'receiver',
      type: 'text',
      isSelected: true,
      isSortable: true,
      width: '200px',
    }
  ]

  static getAction(companyId: string): IAction[] {
    return [
      {
        code: ActionEnum.OPEN_DIALOG,
        dialogName: 'account-dialog',
        tooltipName: 'Новый счёт',
        name: 'Новый счёт',
        permissionName: 'AccountCreate'
      },
      {
        code: ActionEnum.EDIT,
        path: `clients/company/${companyId}/edit`,
        tooltipName: 'Редактировать организацию',
        name: 'Редактировать',
        permissionName: 'CompanyUpdate'
      },
      {
        code: ActionEnum.EXPORT,
        tooltipName: 'Экспорт',
        name:'Экспорт',
        path: `accounts/report/${companyId}`,
        permissionName: 'AccountExportToExcel'
      },
    ]
  }

  static readonly TABLE_ACTIONS: IRowAction[] = [
    {
      type: TableRowActionEnum.EDIT,
      permissionName: 'AccountUpdate',
      iconUrl: 'icons/pen.svg',
    }
  ]
}
