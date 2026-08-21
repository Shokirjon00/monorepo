import { IAction } from '@eskhata/util';
import { ActionEnum } from '@eskhata/util';
import { ICaption, IRowAction } from "@core/interfaces";
import { TableFieldTypes, TableRowActionEnum } from '@eskhata/util';
import { MatchMode } from "@core/enums/match-mode.enum";

export class CompanyConstants {

  static readonly COMPANY_COLUMNS : ICaption[] = [
    {
      key: 'Статус',
      field: 'isActive',
      type: 'status-indicator',
      filterType: 'list',
      mode: MatchMode.equalsOnly,
      isFiltered: false,
      isSelected: true,
      width: '155px',
    },
    {
      key: 'ИНН',
      field: 'inn',
      type: 'text',
      filterType: 'text',
      isSelected: true,
      width: '100px',
    },
    {
      key: 'ID в EQMS',
      field: 'extCodeEqms',
      type: 'text',
      filterType: 'text',
      mode: MatchMode.equalsOnly,
      isSelected: true,
      width: '200px',
    },
    {
      key: 'Эквайер в EQMS',
      field: 'eskhataAcquirer',
      type: 'text',
      filterType: 'text',
      mode: MatchMode.equalsOnly,
      isSortable: true,
      isSelected: true,
      width: '200px',
    },
    {
      key: 'Наименование',
      field: 'name',
      type: 'text',
      filterType: 'text',
      mode: MatchMode.contains,
      isSelected: true,
      width: '200px',
    },
    {
      key: 'Синхронизация с EQMS',
      field: 'readyForEqmsSync',
      type: 'text',
      filterType: 'text',
      mode: MatchMode.equalsOnly,
      isSelected: true,
      width: '200px',
    },
    {
      key: 'Адрес',
      field: 'address',
      type: 'text',
      filterType: 'text',
      mode: MatchMode.contains,
      isSelected: true,
      width: '200px',
    },
    {
      key: 'Филиал',
      field: 'branchName',
      type: 'text',
      filterType: 'text',
      isSelected: true,
      width: '200px',
    },
    {
      key: 'Дата регистрации',
      field: 'registrationDate',
      type: 'date',
      filterType: 'date',
      mode: MatchMode.equalsOnly,
      isSelected: true,
      width: '200px',
    },
    {
      key: 'Синхронизация',
      field: 'lastSyncEqms',
      type: TableFieldTypes.DATETIME,
      filterType: 'date',
      mode: MatchMode.equalsOnly,
      isSelected: true,
      width: '200px',
    },
    {
      key: 'Торговые точки',
      field: 'merchantCount',
      type: 'number',
      filterType: 'text',
      isSelected: true,
      width: '150px',
    },
    {
      key: 'Кассы',
      field: 'posCount',
      type: 'number',
      filterType: 'text',
      isSelected: true,
      width: '250px',
    },
    {
      key: 'Email',
      field: 'email',
      type: 'text',
      filterType: 'text',
      isSelected: true,
      width: '200px',
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

  static readonly COMPANY_ACTIONS: IAction[] = [
    {
      code: ActionEnum.ADD,
      tooltipName: 'Добавить организацию',
      path: 'clients/company/new',
      permissionName: 'CompanyCreate'
    },
    {
      code: ActionEnum.EXPORT_QUEUE,
      tooltipName: 'Экспорт',
      path: 'companies/report',
      permissionName: 'CompanyExportToExcel'
    },
  ];

  static readonly TABLE_ACTIONS: IRowAction[] = [
    {
      type: TableRowActionEnum.EDIT,
      permissionName: 'CompanyUpdate',
      iconUrl: 'icons/pen.svg',
    }
  ]
}
