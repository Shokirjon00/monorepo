import { ActionEnum } from '@eskhata/util';
import { ICaption, IRowAction } from "@core/interfaces";
import { TableRowActionEnum } from '@eskhata/util';

export class PaymentContinueRulesInfoConstants {

  static getActions(rulesId: string): any {
    return [
      {
        code: ActionEnum.ADD,
        tooltipName: 'Добавить соответствие',
        path: `continue-rules/${rulesId}/accordance/new`,
        permissionName: 'PaymentContinueRuleAccordanceCreate'
      },
      {
        code: ActionEnum.EDIT,
        tooltipName: 'Редактировать',
        path: `continue-rules/${rulesId}/edit`,
        permissionName: 'PaymentContinueRuleUpdate'
      },
    ]
  }

  static readonly TABLE_ACTIONS: IRowAction[] = [
    {
      type: TableRowActionEnum.EDIT,
      permissionName: 'PaymentContinueRuleAccordanceUpdate',
      iconUrl: 'icons/pen.svg',
    }
  ];

  static readonly PAYMENT_CONTINUE_RULES_INFO_COLUMNS: ICaption[] = [
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
      key: 'Статус платежа для изменения',
      field: 'paymentStatusName',
      type: 'text',
      filterType: 'text',
      isSelected: true,
      width: '300px',
    },
    {
      key: 'Статус синхронизации платежа для изменения',
      field: 'paymentSyncStatusName',
      type: 'text',
      filterType: 'text',
      isSelected: true,
      width: '300px',
    },
    {
      key: 'Сообщение',
      field: 'message',
      type: 'text',
      filterType: 'text',
      isSelected: true,
      width: '300px',
    },
  ]
}

