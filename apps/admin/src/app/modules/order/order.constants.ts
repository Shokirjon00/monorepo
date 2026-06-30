import { IAction } from "@shared/components/actions/actions.interface";
import { ActionEnum } from "@core/enums/action-enum";
import { ICaption } from "@core/interfaces";
import { MatchMode } from "@core/enums/match-mode.enum";

export class OrderConstants {

  static readonly ORDER: IAction[] = [
    {
      code: ActionEnum.ORDER_STATUS,
      permissionName: 'OrderChangeStatus',
      tooltipName: 'Изменить статус'
    },
  ];

  static readonly ORDER_COLUMNS: ICaption[] = [
    {
      key: 'Галочки',
      field: '',
      type: 'select',
      filterType: 'text',
      isSelected: true,
      width: '60px'
    },
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
      key: 'Тип заказа',
      field: 'orderTypeName',
      type: 'text',
      filterType: 'text',
      isSelected: true,
      isSortable: true,
      isFiltered: true,
      width: '155px',
    },
    {
      key: 'Создан',
      field: 'createdAt',
      type: 'datetime',
      filterType: 'date',
      mode: MatchMode.equalsOnly,
      isSelected: true,
      width: '155px'
    },
    {
      key: 'Организация',
      field: 'companyName',
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
    },
    {
      key: 'Касса',
      field: 'posName',
      type: 'text',
      filterType: 'text',
      isSelected: true,
    },
    {
      key: 'Сумма заказа',
      field: 'orderAmount',
      type: 'number',
      filterType: 'number',
      mode: MatchMode.equalsOnly,
      isSelected: true,
      width: '155px',
    },
    {
      key: 'Оплата',
      field: 'isPaid',
      type: 'text',
      filterType: 'number',
      isSelected: true,
      isFiltered: true,
      isSortable: true,
      width: '155px',
    },
    {
      key: 'Сумма оплаты',
      field: 'paymentAmount',
      type: 'number',
      filterType: 'number',
      mode: MatchMode.equalsOnly,
      isSelected: true,
      width: '155px',
    },
    {
      key: 'Внешний номер заказа',
      field: 'invoiceId',
      type: 'text',
      filterType: 'text',
      isSelected: true,
      width: '200px',
    },
    {
      key: 'ID платежа',
      field: 'paymentId',
      type: 'text',
      filterType: 'text',
      isSelected: true,
      width: '200px',
    },
    {
      key: 'ID внешнего платежа',
      field: 'extPaymentSessionNumber',
      type: 'text',
      filterType: 'text',
      isSelected: true,
      width: '200px',
    },
    {
      key: 'ID заказа',
      field: 'orderId',
      type: 'text',
      filterType: 'text',
      isSelected: true,
      width: '200px',
    },
  ]
}

