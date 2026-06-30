import { ICaption } from '@core/interfaces/table1.interface';
import { MatchMode } from '@core/enums/match-mode.enum';
import { ITab } from '@core/interfaces';
import { IAction } from '@shared/components/actions/action.interface';
import { ActionEnum } from '@core/enums/action-enum';

export class WithdrawalAmountInfoConstants {
  static readonly WITHDRAWAL_AMOUNT_INFO_COLUMNS: ICaption[] = [
    {
      key: 'Статус',
      field: 'statusId',
      fieldSecond: 'statusName',
      type: 'indicator',
      filterType: 'text',
      isFiltered: true,
      isSelected: true,
      isSortable: true,
      width: '155px',
    },
    {
      key: 'Торговая точка',
      field: 'merchantName',
      type: 'text',
      filterType: 'text',
      isSelected: true,
      width: '155px',
    },
    {
      key: 'Дата создания',
      field: 'createdAt',
      type: 'datetime',
      filterType: 'date',
      mode: MatchMode.equalsOnly,
      isSelected: true,
      width: '155px',
    },
    {
      key: 'Период вывода',
      field: 'period',
      type: 'text',
      filterType: 'date',
      mode: MatchMode.equalsOnly,
      isSelected: true,
      width: '155px',
    },
    {
      key: 'Создал',
      field: 'createdByName',
      type: 'text',
      filterType: 'text',
      isSelected: true,
      width: '155px',
    },
    {
      key: 'Сумма',
      field: 'amount',
      type: 'number',
      mode: MatchMode.greaterThanOrEqual,
      filterType: 'text',
      isSelected: true,
      width: '155px',
    },
  ];

  static readonly HEADER_TABS: ITab[] = [
    {
      label: 'Вывод средств',
      path: '/withdrawal-amount/withdrawal-amount-info',
      permissionName: 'IssueMoneyRegistryList',
    },
  ];

  static readonly ACTIONS: IAction[] = [
    {
      code: ActionEnum.WITHDRAWAL,
      name: 'Вывод средств',
      permissionName: 'IssueMoneyRegistryManualy',
    },
  ];
}
