import { ICaption, IRowAction } from '@eskhata/util';
import { TableRowActionEnum } from '@eskhata/util';
import { ITab } from '@eskhata/util';

export class GatewaysConstants {

  static readonly GATEWAYS_COLUMNS : ICaption[] = [
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
      key: 'Название',
      field: 'name',
      type: 'text',
      filterType: 'text',
      isSelected: true,
    },
    {
      key: 'Код',
      field: 'code',
      type: 'text',
      filterType: 'text',
      isSelected: true,
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
      permissionName: 'GatewayUpdate',
      iconUrl: 'icons/pen.svg',
    }
  ]

  static readonly HEADER_TABS: ITab[] = [
    {
      label: 'Системные настройки',
      path: '/setting/system',
      permissionName: 'SettingList'
    },
    {
      label: 'Настройки отчётов',
      path: '/setting/report',
      permissionName: 'ClientReportsList'
    },
    {
      label: 'Шлюзы',
      path: '/setting/gateways',
      permissionName: 'GatewayList'
    }
  ]
}

