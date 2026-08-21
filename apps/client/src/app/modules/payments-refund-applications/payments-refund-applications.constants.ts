import { ICaption } from '@eskhata/util';
import { MatchMode } from "@core/enums/match-mode.enum";
import { IRowAction } from "@core/interfaces";
import { TableRowActionEnum } from '@eskhata/util';
import { TableStatusEnum } from '@eskhata/util';

export class PaymentsRefundApplicationsConstants {

  static readonly PAYMENTS_REFUND_APPLICATIONS_COLUMNS : ICaption[] = [
    {
      key: 'Статус',
      field: 'statusId',
      fieldSecond: 'statusName',
      type: 'indicator',
      filterType: 'payment_refund_application_statuses',
      isSelected: true,
      width: '155px'
    },
    {
      key: 'ID',
      field: 'id',
      type: 'text',
      filterType: 'text',
      isSelected: true,
      mode: MatchMode.equalsOnly,
      width: '155px',
    },
    {
      key: 'Тип',
      field: 'sendType',
      type: 'text',
      filterType: 'send_type',
      mode: MatchMode.equalsOnly,
      isSelected: true,
      width: '155px',
    },
    {
      key: 'Сумма',
      field: 'amount',
      type: 'text',
      filterType: 'text',
      mode: MatchMode.greaterThanOrEqual,
      isSelected: true,
    },
    {
      key: 'Создан',
      field: 'createdAt',
      type: 'datetime',
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
      key: 'Внешний ID',
      field: 'extId',
      type: 'text',
      filterType: 'text',
      isSelected: true,
    },
    {
      key: 'Номер заявки',
      field: 'applicationNumber',
      type: 'text',
      filterType: 'text',
      mode: MatchMode.equalsOnly,
      isSelected: true,
    },
    {
      key: 'Банк эмитент',
      field: 'bankEmitentName',
      type: 'text',
      filterType: 'text',
      isSelected: true,
    },
    {
      key: 'ID платежа',
      field: 'paymentId',
      type: 'text',
      filterType: 'text',
      isSelected: true,
    },
    {
      key: 'Точка',
      field: 'merchantName',
      type: 'text',
      filterType: 'text',
      isSelected: true,
      width: '155px'
    },
    {
      key: 'Касса',
      field: 'posName',
      type: 'text',
      filterType: 'text',
      isSelected: true,
      width: '155px'
    },
    {
      key: 'Описание',
      field: 'description',
      type: 'text',
      filterType: 'text',
      isSelected: true,
      isSortable: true,
    },
    {
      key: 'Причина возврата',
      field: 'paymentRefundReason',
      type: 'text',
      filterType: 'text',
      isSelected: true,
    },
    {
      key: 'Ошибка',
      field: 'errorMessage',
      type: 'text',
      filterType: 'text',
      isSelected: true,
    },
    {
      key: 'Изменено',
      field: 'modifiedAt',
      type: 'datetime',
      filterType: 'date',
      isSelected: true,
    },
    {
      key: 'Изменил',
      field: 'modifiedByName',
      type: 'text',
      filterType: 'text',
      isSelected: true,
    },
    {
      key: '',
      field: 'canConfirm',
      type: 'confirm',
      isSelected: false,
      isSortable: false,
      isFiltered: true
    }
  ]

  static readonly TABLE_ACTIONS: IRowAction[] = [
    {
      type: TableRowActionEnum.CONFIRM,
      permissionName: 'PaymentRefundApplicationConfirm',
      iconUrl: 'icons/check-black.svg',
      defaultValue: true
    },
    {
      type: TableRowActionEnum.CONFIRM,
      permissionName: 'PaymentRefundApplicationConfirm',
      iconUrl: 'icons/cancel.svg',
      defaultValue: false
    }
  ];

  static readonly  PAYMENT_STATUS_GROUP = [
    {name: 'Все', value: '_'},
    {name: 'Новая', value: '3949123c-1cf1-4606-b064-25e4871bb8f2'},
    {name: 'В обработке', value: '772281a9-2acf-4ce3-b306-cbbf0f9c9799'},
    {name: 'Отклонена', value: '87c783ca-2ed1-438f-8200-544c28fcc8d6'},
    {name: 'Одобрена', value: 'd1bd6438-9436-4dab-b263-63ee6c1f59d3'},
  ];

  static readonly dictionary: Record<string, string> = {
    [TableStatusEnum.APPLICATION_COMPLETED]: 'completed',
    [TableStatusEnum.APPLICATION_REJECTED]: 'rejected',
    [TableStatusEnum.APPLICATION_NEW]: 'no-verified',
    [TableStatusEnum.APPLICATION_IN_PROCESS]: 'in-process',
  };

}
