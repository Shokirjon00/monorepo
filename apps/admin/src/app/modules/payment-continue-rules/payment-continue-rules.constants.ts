import { IAction } from "@shared/components/actions/actions.interface";
import { ActionEnum } from "@core/enums/action-enum";
import { ICaption, IRowAction } from "@core/interfaces";
import { TableRowActionEnum } from "@core/enums/table";
import { MatchMode } from "@core/enums/match-mode.enum";

export class PaymentContinueRulesConstants {

  static readonly PAYMENTS_CONTINUE_RULES_ACTIONS: IAction[] = [
    {
      code: ActionEnum.ADD,
      tooltipName: 'Добавить правила',
      path: 'continue-rules/new',
      permissionName: 'PaymentContinueRuleCreate'
    },
  ];

  static readonly TABLE_ACTIONS: IRowAction[] = [
    {
      type: TableRowActionEnum.EDIT,
      permissionName: 'PaymentContinueRuleUpdate',
      iconUrl: 'icons/pen.svg',
    }
  ];

  static readonly PAYMENT_CONTINUE_RULES_COLUMNS : ICaption[] = [
    {
      key: 'Статус',
      field: 'isActive',
      type: 'status-indicator',
      filterType: 'text',
      isFiltered: true,
      isSelected: true,
      width: '150px',
    },
    {
      key: 'Шлюз списания',
      field: 'fromGatewayName',
      type: 'text',
      filterType: 'text',
      isSelected: true,
      width: '150px',
    },
    {
      key: 'Шлюз зачисления',
      field: 'toGatewayName',
      type: 'text',
      filterType: 'text',
      isSelected: true,
      width: '150px',
    },
    {
      key: 'Текущий статус платежа',
      field: 'paymentStatusName',
      type: 'text',
      filterType: 'text',
      isSelected: true,
      width: '300px',
    },
    {
      key: 'Текущий статус синхронизации платежа',
      field: 'paymentSyncStatusName',
      type: 'text',
      filterType: 'text',
      isSelected: true,
      width: '300px',
    },
    {
      key: 'Доступные статусы платежа',
      field: 'allowedPaymentStatuses',
      type: 'text',
      filterType: 'text',
      isSortable: true,
      isSelected: true,
      width: '300px',
    },
    {
      key: 'Счетчик',
      field: 'usageCount',
      type: 'number',
      filterType: 'text',
      mode: MatchMode.equalsOnly,
      isSelected: true,
      width: '150px',
    },
    {
      key: 'Создано',
      field: 'createdAt',
      type: 'datetime',
      filterType: 'date',
      isSelected: true,
      width: '150px',
    },
    {
      key: 'Изменено',
      field: 'modifiedAt',
      type: 'datetime',
      filterType: 'date',
      isSelected: true,
      width: '150px',
    },
    {
      key: 'Создал',
      field: 'createdByName',
      type: 'text',
      filterType: 'text',
      isSelected: true,
      width: '150px',
    },
    {
      key: 'Изменил',
      field: 'modifiedByName',
      type: 'text',
      filterType: 'text',
      isSelected: true,
      width: '150px',
    },
  ]
}

