import { ICaption } from '@eskhata/util';
import { IRowAction, ITab } from "@core/interfaces";
import { TableRowActionEnum } from '@eskhata/util';
import { IAction } from '@eskhata/util';
import { ActionEnum } from '@eskhata/util';

export class PosConstants {

  static readonly POS_COLUMNS: ICaption[] = [
    {
      key: 'Статус',
      field: 'isActive',
      type: 'status-indicator',
      filterType: 'text',
      isFiltered: true,
      isSelected: true,
      width: "150px",
    },
    {
      key: 'Наименование',
      field: 'name',
      type: 'text',
      filterType: 'text',
      isSelected: true,
      width: "200px",
    },
    {
      key: 'Точка',
      field: 'merchantName',
      type: 'text',
      filterType: 'text',
      isSelected: true,
      width: "200px",
    },
    {
      key: 'ID в EQMS',
      field: 'extCodeEqms',
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
      width: "200px",
    },
    {
      key: 'Тип кассы',
      field: 'posTypeName',
      type: 'text',
      filterType: 'text',
      isSelected: true,
      width: "200px",
    },
    {
      key: 'Создано',
      field: 'createdAt',
      type: 'datetime',
      isSelected: true,
      filterType: 'date',
      width: "200px",
    },
    {
      key: 'Изменено',
      field: 'modifiedAt',
      type: 'datetime',
      filterType: 'text',
      isSelected: true,
    },
  ]

  static readonly TABLE_ACTIONS: IRowAction[] = [
    {
      type: TableRowActionEnum.EDIT,
      permissionName: 'PosUpdate',
      iconUrl: 'icons/pen.svg',
    }
  ];

  static getAction(merchantId: string): IAction[] {
    return [
      {
        code: ActionEnum.ADD,
        tooltipName: 'Добавить кассу',
        path: `merchant/merchant/${merchantId}/poses/new`,
        name: 'Добавить кассу',
        permissionName: 'PosCreate'
      },
      {
        code: ActionEnum.EXPORT,
        tooltipName: 'Экспорт',
        path: 'poses/report',
        name: 'Экспорт',
        permissionName: 'PosExportToExcel',
        filterItem: `merchantId==${merchantId}`
      },
    ]
  }

  static getHeaderTabsIds(merchantId: string): ITab[] {
    return [
      {
        label: 'Кассы',
        path: `/merchant/merchant/${merchantId}/poses`,
        permissionName: 'PosList'
      },
      {
        label: 'Информация о торговой точке',
        path: `/merchant/merchant/${merchantId}/info`,
        permissionName: 'MerchantDetail'
      },
    ]
  }

  static getPosHeader(merchantId: string): ITab[] {
    return [
      {
        label: 'Кассы',
        path: `/merchant/merchant/${merchantId}/poses`,
        permissionName: 'PosList'
      },
      {
        label: 'Информация о торговой точке',
        path: `/merchant/merchant/${merchantId}/info`,
        permissionName: 'MerchantDetail'
      },
      {
        label: 'Настройки интеграции',
        path: `/merchant/merchant/${merchantId}/integration`,
        permissionName: 'MerchantIntegrationConfiguration'
      }
    ]
  }
}
