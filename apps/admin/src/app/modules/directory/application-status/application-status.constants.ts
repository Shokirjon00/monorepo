import { ICaption, IRowAction } from "@core/interfaces";
import { IAction } from '@eskhata/util';
import { ActionEnum } from '@eskhata/util';
import { TableRowActionEnum } from '@eskhata/util';
import {MatchMode} from "@core/enums/match-mode.enum";

export class ApplicationStatusConstants {

  static readonly APPLICATION_STATUS_COLUMNS : ICaption[] = [
    {
      key: 'Статус',
      field: 'isActive',
      type: 'status-indicator',
      mode: MatchMode.equalsOnly,
      filterType: 'list',
      isSelected: true,
      isSortable: true,
      width: '150px',
    },
    {
      key: 'Наименование',
      field: 'name',
      type: 'text',
      filterType: 'text',
      isSelected: true,
      width: '250px',
    },
    {
      key: 'СМС',
      field: 'notificationText',
      type: 'text',
      filterType: 'text',
      isSelected: true,
      width: '150px',
    },
    {
      key: 'Уведомление',
      field: 'canNotify',
      isFiltered: true,
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
    }
  ]

  static readonly APPLICATION_STATUS_ACTIONS: IAction[] = [
    {
      code: ActionEnum.ADD,
      tooltipName: 'Добавить статус заявки',
      path: 'directory/application-status/new',
      permissionName: 'MerchantApplicationStatusCreate'
    }
  ];

  static readonly TABLE_ACTIONS: IRowAction[] = [
    {
      type: TableRowActionEnum.EDIT,
      permissionName: 'MerchantApplicationStatusUpdate',
      iconUrl: 'icons/pen.svg',
    }
  ]
}
