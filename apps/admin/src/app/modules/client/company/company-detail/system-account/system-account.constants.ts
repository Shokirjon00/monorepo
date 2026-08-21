import { ICaption } from "@core/interfaces";
import { IAction } from '@eskhata/util';
import { ActionEnum } from '@eskhata/util';

export class SystemAccountConstants {

  static readonly SYSTEM_ACCOUNT_COLUMNS: ICaption[] = [
    {
      key: 'Тип счёта',
      field: 'typeName',
      type: 'text',
      filterType: 'text',
      isSelected: true,
      isSortable: true,
      width: '200px',
    },
    {
      key: 'Точка',
      field: 'merchantName',
      type: 'text',
      filterType: 'text',
      isSelected: true,
      isSortable: true,
      width: '155px',
    },
    {
      key: 'Номер счета',
      field: 'number',
      type: 'text',
      filterType: 'text',
      isSelected: true,
      isSortable: true,
      width: '155px',
      isFiltered: true,
    },
    {
      key: 'Остаток',
      field: 'balance',
      type: 'number',
      filterType: 'text',
      isSelected: true,
      isSortable: true,
      width: '155px',
      isFiltered: true,
    },
    {
      key: 'Валюта',
      field: 'currencyName',
      type: 'text',
      filterType: 'text',
      isSelected: true,
      isSortable: true,
      width: '155px',
      isFiltered: true,
    },
    {
      key: 'Банк',
      field: 'bankName',
      type: 'text',
      filterType: 'text',
      isSelected: true,
      isSortable: true,
      width: '155px',
      isFiltered: true,
    }
  ]

  static getAction(companyId: string): IAction[] {
    return [
      {
        code: ActionEnum.EDIT,
        path: `clients/company/${companyId}/edit`,
        tooltipName: 'Редактировать организацию',
        name: 'Редактировать',
        permissionName: 'CompanyUpdate'
      },
    ]
  }
}
