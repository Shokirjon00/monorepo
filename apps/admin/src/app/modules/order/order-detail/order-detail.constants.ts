import { ICaption } from "@core/interfaces";
import { MatchMode } from "@core/enums/match-mode.enum";
import { ITab } from '@eskhata/util';
import { ActionEnum } from '@eskhata/util';
import { IAction } from '@eskhata/util';

export class OrderDetailConstants {

  static readonly ORDER_DETAIL_COLUMNS: ICaption[] = [
    {
      key: 'Статус',
      field: 'orderStatusName',
      type: 'text',
      filterType: 'text',
      isFiltered: false,
      isSelected: true,
      width: '155px',
    },
    {
      key: 'Создан',
      field: 'createdAt',
      type: 'datetime',
      filterType: 'date',
      isSelected: true,
      width: '170px',
    },
    {
      key: 'Пользователь',
      field: 'userShortName',
      type: 'text',
      filterType: 'text',
      isSelected: true,
    },
    {
      key: 'Кол-во взаимодействий',
      field: 'interactionAttempts',
      type: 'text',
      filterType: 'text',
      mode: MatchMode.equalsOnly,
      isSelected: true,
    },
    {
      key: 'Причина отказа',
      field: 'cancelReason',
      type: 'text',
      filterType: 'text',
      isSelected: true,
    }
  ]

  static getHeaderTabs(orderId: string): ITab[] {
    return [
      {
        label: 'История заказа',
        path: `/order/detail/${orderId}/order-detail-list`,
        permissionName: 'OrderHistoryList',
      },
      {
        label: 'Информация о заказе',
        path: `/order/detail/${orderId}/order-detail-histories`,
        permissionName: 'OrderDetail',
      },
    ]
  }

  static readonly ORDER_DETAIL_ACTIONS: IAction[] = [
    {
      code: ActionEnum.ORDER_WEBHOOK,
      tooltipName: 'Повторная отправка Вебхука',
      permissionName: 'OrderSendWebhookRetry',
    },
  ];
}

