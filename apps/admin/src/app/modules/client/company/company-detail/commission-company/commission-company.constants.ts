import { ICaption, IOptionAction, IRowAction } from "@core/interfaces";
import { TableRowActionEnum } from '@eskhata/util';
import { IAction } from '@eskhata/util';
import { ActionEnum } from '@eskhata/util';

export class CommissionCompanyConstants {

  static readonly COMMISSION_COMPANY_COLUMNS : ICaption[] = [
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
      key: 'Наименование комиссии',
      field: 'commissionName',
      type: 'text',
      filterType: 'text',
      isSelected: true,
      width: '155px',
    },
    {
      key: 'Период',
      fieldSecond: 'startDate',
      fieldThird: 'endDate',
      type: 'multiple-value',
      filterType: 'text',
      isSelected: true,
      isSortable: true,
      width: '155px',
    },
    {
      key: 'Тип комиссии',
      field: 'commissionTypeName',
      type: 'text',
      filterType: 'text',
      isSelected: true,
      width: '155px',
    },
    {
      key: 'Создано',
      field: 'createdAt',
      type: 'date',
      filterType: 'date',
      isSelected: true,
    },
    {
      key: 'Создал',
      field: 'createdByName',
      type: 'text',
      filterType: 'text',
      isSelected: true,
    },
    {
      key: 'Изменено',
      field: 'modifiedAt',
      type: 'date',
      filterType: 'date',
      isSelected: true,
    },
    {
      key: 'Изменил',
      field: 'modifiedByName',
      type: 'text',
      filterType: 'text',
      isSelected: true,
    }
  ]

  static readonly TABLE_ACTIONS: IRowAction[] = [
    {
      type: TableRowActionEnum.EDIT,
      permissionName: 'CommissionCompanyUpdate',
      iconUrl: 'icons/pen.svg',
    }
  ];

  static readonly TABLE_SETTING_OPTIONS: IOptionAction[] = [
    {
      type: TableRowActionEnum.CHANGE_STATUS,
      permissionName: 'CommissionCompanyActiveStatus'
    }
  ];

  static getAction(companyId: string): IAction[] {
    return [
      {
        code: ActionEnum.ADD,
        path: `clients/company/${companyId}/commission/new`,
        tooltipName: 'Добавить новую комиссию',
        name: 'Добавить новую комиссию',
        permissionName: 'CommissionCompanyCreate'
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
        path: `commission_companies/report/${companyId}`,
        permissionName: 'CommissionCompanyExportToExcel'
      },
    ]
  }

}
