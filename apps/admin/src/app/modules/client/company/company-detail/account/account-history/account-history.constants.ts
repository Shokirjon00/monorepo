import { ICaption } from "@core/interfaces";
import { MatchMode } from "@core/enums/match-mode.enum";
import { IAction } from '@eskhata/util';
import { ActionEnum } from '@eskhata/util';

export class AccountHistoryConstants {

  static readonly ACCOUNT_HISTORY_COLUMNS: ICaption[] = [
    {
      key: 'ID платежа',
      field: 'paymentId',
      type: 'text',
      filterType: 'text',
      isSelected: true,
      width: '200px',
    },
    {
      key: 'Номер счета',
      field: 'accountNumber',
      type: 'text',
      filterType: 'text',
      isSelected: true,
      width: '200px',
    },
    {
      key: 'Баланс до',
      field: 'balanceBefore',
      type: 'number',
      filterType: 'number',
      mode: MatchMode.equalsOnly,
      isSelected: true,
      width: '155px',
    },
    {
      key: 'Сумма',
      field: 'amount',
      type: 'number',
      filterType: 'number',
      mode: MatchMode.equalsOnly,
      isSelected: true,
      width: '155px',
    },
    {
      key: 'Баланс',
      field: 'balance',
      type: 'number',
      filterType: 'number',
      mode: MatchMode.equalsOnly,
      isSelected: true,
      width: '155px',
    },
    {
      key: 'Тип истории',
      field: 'accountTransactionTypeName',
      type: 'text',
      filterType: 'text',
      isSelected: true,
      width: '155px',
    },
    {
      key: 'Тип операции',
      field: 'accountOperationTypeName',
      type: 'text',
      filterType: 'text',
      isSelected: true,
      width: '155px',
    },
    {
      key: 'Сервис',
      field: 'serviceName',
      type: 'text',
      filterType: 'text',
      isSelected: true,
      width: '155px'
    },
    {
      key: 'Дата создания',
      field: 'createdAt',
      type: 'date',
      filterType: 'date',
      isSelected: true,
      width: '150px',
    }
  ]

  static getAction(accountId: string): IAction[] {
    return [
      {
        code: ActionEnum.EXPORT_QUEUE,
        path: `account_transactions/report/${accountId}`,
        tooltipName: 'Экспорт',
        permissionName: 'AccountTransactionsExportToExcel'
      },
    ]
  }
}
