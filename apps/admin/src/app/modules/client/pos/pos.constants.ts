import { ICaption, IRowAction } from "@core/interfaces";
import { MatchMode } from "@core/enums/match-mode.enum";
import { TableFieldTypes, TableRowActionEnum } from "@core/enums/table";
import { IAction } from "@shared/components/actions/actions.interface";
import { ActionEnum } from "@core/enums/action-enum";
import { ITab } from "@core/interfaces/header.interface";

export class PosConstants {

  static readonly POS_COLUMNS: ICaption[] = [
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
      key: 'Точка',
      field: 'merchantName',
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
      key: 'Номер телефона',
      field: 'smsPhoneNumbers',
      type: 'text',
      filterType: 'text',
      isSelected: true,
      width: '150px',
    },
    {
      key: 'Email',
      field: 'emails',
      type: 'text',
      filterType: 'text',
      isSelected: true,
      width: '200px',
    },
    {
      key: 'Тип кассы',
      field: 'posTypeName',
      type: 'text',
      filterType: 'text',
      isSelected: true,
      width: '200px',
    },
    {
      key: 'Дата регистрации',
      field: 'createdAt',
      type: 'date',
      filterType: 'date',
      isSelected: true,
      width: '170px',
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

  static readonly POS_ACTION: IAction[] = [
    {
      code: ActionEnum.EXPORT_QUEUE,
      tooltipName: 'Экспорт',
      path: 'poses/report',
      permissionName: 'PosExportToExcel'
    },
  ]

  static readonly TABLE_ACTIONS: IRowAction[] = [
    {
      type: TableRowActionEnum.EDIT,
      permissionName: 'PosUpdate',
      iconUrl: 'icons/pen.svg',
    }
  ]

  static getAction(companyId: string, merchantId: string): IAction[] {
    return [
      {
        code: ActionEnum.ADD,
        tooltipName: 'Добавить кассу',
        path: `clients/company/${companyId}/merchant/${merchantId}/poses/new`,
        permissionName: 'PosCreate'
      },
      {
        code: ActionEnum.EDIT,
        tooltipName: 'Редактировать торговую точку',
        path: `clients/company/${companyId}/merchant/${merchantId}/edit`,
        permissionName: 'MerchantUpdate'
      },
    ]
  }

  static getHeaderTabsIds(companyId: string, merchantId: string): ITab[] {
    return [
      {
        label: 'Кассы',
        path: `/clients/company/${companyId}/merchant/${merchantId}/poses`,
        permissionName: 'PosList'
      },
      {
        label: 'Pos-terminal',
        path: `/clients/company/${companyId}/merchant/${merchantId}/pos-terminal`,
        permissionName: 'PosTerminalList'
      },
      {
        label: 'Информация о торговой точке',
        path: `/clients/company/${companyId}/merchant/${merchantId}/info`,
        permissionName: 'MerchantDetail'
      },
      {
        label: 'Доп.параметры',
        path: `/clients/company/${companyId}/merchant/${merchantId}/service`,
        permissionName: 'MerchantServiceList'
      },
      {
        label: 'Настройки Pos-terminal',
        path: `/clients/company/${companyId}/merchant/${merchantId}/pos-terminal-setting`,
        permissionName: 'MerchantComponentList'
      },
    ]
  }

  static getPosHeader(merchantId: string): ITab[] {
    return [
      {
        label: 'Кассы',
        path: `/clients/merchant/${merchantId}/poses`,
        permissionName: 'PosList'
      },
      {
        label: 'Pos-terminal',
        path: `/clients/merchant/${merchantId}/pos-terminal`,
        permissionName: 'PosTerminalList'
      },
      {
        label: 'Информация о торговой точке',
        path: `/clients/merchant/${merchantId}/info`,
        permissionName: 'MerchantDetail'
      },
      {
        label: 'Доп.параметры',
        path: `/clients/merchant/${merchantId}/service`,
        permissionName: 'MerchantServiceList'
      },
      {
        label: 'Настройки Pos-terminal',
        path: `/clients/merchant/${merchantId}/pos-terminal-setting`,
        permissionName: 'MerchantComponentList'
      },
    ]
  }

  static getActionPos(merchantId: string): IAction[] {
    return  [
      {
        code: ActionEnum.ADD,
        tooltipName: 'Добавить кассу',
        path: `clients/merchant/${merchantId}/poses/new`,
        permissionName: 'PosCreate'
      },
      {
        code: ActionEnum.EDIT,
        tooltipName: 'Редактировать торговую точку',
        path: `clients/merchant/${merchantId}/edit`,
        permissionName: 'MerchantUpdate'
      },
    ]
  }
}
