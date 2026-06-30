import { ICaption, IRowAction } from "@core/interfaces/table.interface";
import {MatchMode} from "@core/enums/match-mode.enum";
import { TableRowActionEnum } from "@core/enums/table";

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
      mode: MatchMode.equalsOnly,
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
      key: 'Эмитент',
      field: 'bankEmitentName',
      type: 'text',
      filterType: 'text',
      isSelected: true,
    },
    {
      key: 'ID платежа',
      field: 'paymentId',
      type: 'link',
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
      defaultValue: true,
      showField: 'canConfirm',
      showValue: true
    },
    {
      type: TableRowActionEnum.CONFIRM,
      permissionName: 'PaymentRefundApplicationConfirm',
      iconUrl: 'icons/cancel.svg',
      defaultValue: false,
      showField: 'canConfirm',
      showValue: true
    }
  ];
}
