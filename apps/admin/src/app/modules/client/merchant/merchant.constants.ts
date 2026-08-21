import { ITab } from '@eskhata/util';
import { IAction } from '@eskhata/util';
import { ActionEnum } from '@eskhata/util';
import { ICaption, IOptionAction, IRowAction } from "@core/interfaces";
import { TableFieldTypes, TableRowActionEnum } from '@eskhata/util';
import { MatchMode } from "@core/enums/match-mode.enum";

export class MerchantConstants {

  static readonly MERCHANT_COLUMNS : ICaption[] = [
    {
      key: 'Статус',
      field: 'isActive',
      type: 'status-indicator',
      filterType: 'list',
      mode: MatchMode.equalsOnly,
      isFiltered: false,
      isSelected: true,
      width: '150px',
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
      isSelected: true,
      width: '200px',
    },
    {
      key: 'Организация',
      field: 'companyName',
      type: 'link',
      filterType: 'text',
      isSelected: true,
      width: '200px',
    },
    {
      key: 'Регион',
      field: 'regionName',
      type: 'text',
      filterType: 'text',
      isSelected: true,
      width: '150px',
    },
    {
      key: 'Район',
      field: 'areaName',
      type: 'text',
      filterType: 'text',
      isSelected: true,
      width: '150px',
    },
    {
      key: 'Город',
      field: 'cityName',
      type: 'text',
      filterType: 'text',
      isSelected: true,
      width: '100px',
    },
    {
      key: 'Филиал банка Эсхата',
      field: 'branchName',
      type: 'text',
      filterType: 'text',
      isSelected: true,
      width: '200px',
    },
    {
      key: 'Адрес',
      field: 'address',
      type: 'text',
      filterType: 'text',
      isSelected: true,
      width: '200px',
    },
    {
      key: 'Счёт к получению',
      field: 'activeAccountNumber',
      type: 'text',
      filterType: 'text',
      isSelected: true,
      width: '200px',
    },
    {
      key: 'Счёт к оплате',
      field: 'passiveAccountNumber',
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
      key: 'Кассы',
      field: 'posCount',
      type: 'number',
      filterType: 'text',
      isSelected: true,
      width: '120px',
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

  static getHeaderTabs(companyId: string): ITab[] {
    return [
      {
        label: 'Торговые точки',
        path: `/clients/company/${companyId}/merchant`,
        selected: true,
      },
      {
        label: 'Кэшбэки',
        path: `/clients/company/${companyId}/cashback`,
        permissionName: 'CashbackCompanyList'
      },
      {
        label: 'Информация об организации',
        path: `/clients/company/${companyId}/info`,
        permissionName: 'CompanyDetail',
        selected: false,
      },
      {
        label: 'Эквайеры',
        path: `/clients/company/${companyId}/acquirer`,
        permissionName: 'CompanyAcquirersDictionary',
        selected: false,
      },
    ]
  }

  static getHeaderAcquirerTabs(companyId: string): ITab[] {
    return [
      {
        label: 'Торговые точки',
        path: `/clients/company/${companyId}/merchant`
      },
      {
        label: 'Кэшбэки',
        path: `/clients/company/${companyId}/cashback`,
        permissionName: 'CashbackCompanyList'
      },
      {
        label: 'Комиссия',
        path: `/clients/company/${companyId}/commission`,
        permissionName: 'CommissionCompanyList'
      },
      {
        label: 'Счета',
        path: `/clients/company/${companyId}/accounts`,
        permissionName: 'AccountRequisites'
      },
      {
        label: 'Системные счета',
        path: `/clients/company/${companyId}/system-accounts`,
        permissionName: 'AccountSystemRequisites'
      },
      {
        label: 'Информация об организации',
        path: `/clients/company/${companyId}/info`,
        permissionName: 'CompanyDetail'
      },
      {
        label: 'Эквайеры',
        path: `/clients/company/${companyId}/acquirer`,
        permissionName: 'CompanyAcquirersDictionary'
      },
      {
        label: 'Настройки интеграции',
        path: `/clients/company/${companyId}/integration-setting`,
        permissionName: 'MerchantIntegrationConfigurationList'
      }
    ]
  }

  static getAction(companyId: string): IAction[] {
    return [
      {
        code: ActionEnum.ADD,
        path: `clients/company/${companyId}/merchant/new`,
        tooltipName: 'Новая точка продаж',
        name: 'Новая точка',
        permissionName: 'MerchantCreate'
      },
      {
        code: ActionEnum.EDIT,
        path: `clients/company/${companyId}/edit`,
        tooltipName: 'Редактировать организацию',
        name: 'Редактировать',
        permissionName: 'CompanyUpdate'
      },
    ]
  }

  static readonly MERCHANT_ACTION: IAction[] = [
    {
      code: ActionEnum.EXPORT_QUEUE,
      tooltipName: 'Экспорт',
      path: 'merchants/report',
      permissionName: 'MerchantExportToExcel'
    },
  ]

  static readonly TABLE_ACTIONS: IRowAction[] = [
    {
      type: TableRowActionEnum.EDIT,
      permissionName: 'MerchantUpdate',
      iconUrl: 'icons/pen.svg',
    }
  ]

  static readonly TABLE_SETTING_OPTIONS: IOptionAction[] = [
    {
      type: TableRowActionEnum.CHANGE_STATUS,
      permissionName: 'MerchantActiveStatus'
    }
  ];
}
