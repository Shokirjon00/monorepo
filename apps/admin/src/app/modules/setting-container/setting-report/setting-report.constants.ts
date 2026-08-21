import { ICaption, IRowAction } from '@eskhata/util';
import { TableRowActionEnum } from '@eskhata/util';
import { ITab } from '@eskhata/util';
import {IAction} from '@eskhata/util';
import {ActionEnum} from '@eskhata/util';

export class SettingReportConstants {

  static readonly SETTING_REPORT_COLUMNS : ICaption[] = [
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
      key: 'ID',
      field: 'id',
      type: 'text',
      filterType: 'text',
      isSelected: true,
    },
    {
      key: 'Наименование',
      field: 'name',
      type: 'text',
      filterType: 'text',
      isSelected: true,
    },
    {
      key: 'Кем создан',
      field: 'createdByName',
      type: 'text',
      filterType: 'text',
      isSelected: true,
    },
    {
      key: 'Кем изменён',
      field: 'modifiedByName',
      type: 'text',
      filterType: 'text',
      isSelected: true,
    },
    {
      key: 'Дата создания',
      field: 'createdAt',
      type: 'date',
      filterType: 'date',
      isSelected: true,
    },
    {
      key: 'Дата изменения',
      field: 'modifiedAt',
      type: 'date',
      filterType: 'date',
      isSelected: true,
    },
    {
      key: 'Шаблон отчёта',
      field: 'templateFileId',
      type: 'download',
      isSortable: true,
      isFiltered: true,
      isSelected: true,
    }
  ]

  static readonly TABLE_ACTIONS: IRowAction[] = [
    {
      type: TableRowActionEnum.EDIT,
      permissionName: 'ClientReportsUpdate',
      iconUrl: 'icons/pen.svg',
    }
  ]

  static readonly EXPORT_QUEUE_ACTIONS: IAction[] = [
    {
      code: ActionEnum.STAMP,
      dialogName: 'stamp-dialog',
      tooltipName: 'Штамп',
      name: 'Штамп',
    },
  ];

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

