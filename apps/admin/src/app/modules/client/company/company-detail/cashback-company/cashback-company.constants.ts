import { ICaption, IRowAction } from "@core/interfaces";
import { TableRowActionEnum } from '@eskhata/util';
import { IAction } from '@eskhata/util';
import { ActionEnum } from '@eskhata/util';

export class CashbackCompanyConstants {

  static readonly CASHBACK_COMPANY_COLUMNS : ICaption[] = [
    {
      key: 'Статус',
      field: 'isActive',
      type: 'status-indicator',
      filterType: 'text',
      isFiltered: true,
      isSelected: true,
      width: '155px',
    },
    {
      key: 'От мерчанта',
      field: 'companyCashbackName',
      fieldSecond: 'companyStartDate',
      fieldThird: 'companyEndDate',
      type: 'multiple-value',
      filterType: 'text',
      isSelected: true,
      width: '155px',
    },
    {
      key: 'От банка',
      field: 'bankCashbackName',
      fieldSecond: 'bankStartDate',
      fieldThird: 'bankEndDate',
      type: 'multiple-value',
      filterType: 'text',
      isSelected: true,
      width: '155px',
    },
    {
      key: 'Тип кэшбэка',
      field: 'cashbackAccrualTypeName',
      type: 'text',
      filterType: 'text',
      isSelected: true,
      width: '155px',
    },
    {
      key: 'Организация',
      field: 'companyName',
      type: 'text',
      filterType: 'text',
      isSelected: true,
      width: '155px',
    },
    {
      key: 'Пользователь',
      field: 'userShortName',
      type: 'text',
      filterType: 'text',
      isSelected: true,
      width: '155px',
    }
  ]

  static readonly TABLE_ACTIONS: IRowAction[] = [
    {
      type: TableRowActionEnum.EDIT,
      permissionName: 'CashbackCompanyUpdate',
      iconUrl: 'icons/pen.svg',
    }
  ]

  static getAction(companyId: string): IAction[] {
    return [
      {
        code: ActionEnum.ADD,
        path: `clients/company/${companyId}/cashback/new`,
        tooltipName: 'Добавить новый кэшбэк',
        name: 'Добавить новый кэшбэк',
        permissionName: 'CashbackCompanyCreate'
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
        name: 'Экспорт',
        path: `cashback_companies/report/${companyId}`,
        permissionName: 'CashbackCompanyExportToExcel'
      },
    ]
  }

}
