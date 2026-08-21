import { ICaption, IRowAction } from '@eskhata/util';
import { TableRowActionEnum } from '@eskhata/util';
import { ITab } from '@eskhata/util';

export class SettingConstants {

  static readonly SETTING_COLUMNS : ICaption[] = [
    {
      key: 'Описание',
      field: 'description',
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
      text: 'Редактировать',
      permissionName: 'SettingUpdate',
      iconUrl: 'icons/pen.svg',
    },
    {
      type: TableRowActionEnum.SETTING,
      text: 'Редактировать',
      permissionName: 'SettingUpdate',
      iconUrl: 'icons/setup.svg',
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

