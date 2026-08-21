import { IAction } from '@eskhata/util';
import { ActionEnum } from '@eskhata/util';
import { ICaption, IRowAction } from "@core/interfaces";
import { TableRowActionEnum } from '@eskhata/util';
import { ITab } from '@eskhata/util';

export class WithdrawalAmountInfoConstants {

  static readonly WITHDRAWAL_AMOUNT_INFO_ACTION: IAction[] = [
    {
      code: ActionEnum.ADD,
      tooltipName: 'Выборочный вывод',
      icon: './assets/icons/menu-rec.svg',
      path: 'withdrawal-amount/info/withdrawal-select-company',
      permissionName: 'ManuallyIssueMoneyRegistries'
    },
    {
      code: ActionEnum.OPEN_DIALOG,
      dialogName: 'issue-money-registries',
      icon: './assets/icons/credit-card-outcome.svg',
      tooltipName: 'Запустить полный вывод',
      permissionName: 'AllCompaniesIssueMoneyRegistries'
    },
  ];

  static readonly TABLE_ACTIONS: IRowAction[] = [
    {
      type: TableRowActionEnum.EDIT,
      permissionName: 'IssueMoneyUpdate',
      iconUrl: 'icons/pen.svg',
    }
  ];

  static readonly HEADER_TABS: ITab[] = [
    {
      label: 'Список выводов',
      path: '/withdrawal-amount/info',
      permissionName: 'IssueMoneyRegistryList'
    },
    {
      label: 'Настройки вывода',
      path: '/withdrawal-amount/setting',
      permissionName: 'IssueMoneySettingList'
    }
  ];

  static readonly WITHDRAWAL_AMOUNT_INFO_COLUMNS: ICaption[] = [
    {
      key: 'Статус',
      field: 'issueMoneyRegistryStatusName',
      type: 'text',
      filterType: 'text',
      isSelected: true,
      width: '155px',
    },
    {
      key: 'Организация',
      field: 'companyName',
      type: 'link',
      filterType: 'text',
      isSelected: true,
      width: '155px',
    },
    {
      key: 'Создано',
      field: 'createdAt',
      type: 'date',
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
      key: 'Количество',
      field: 'issueMoneyRegistriesMerchantsCount',
      type: 'number',
      filterType: 'number',
      isSelected: true,
      width: '155px',
    },
    {
      key: 'Сумма',
      field: 'amount',
      type: 'number',
      filterType: 'number',
      isSelected: true,
      width: '155px',
    },
    {
      key: 'Тип',
      field: 'isSchedulerName',
      type: 'text',
      filterType: 'text',
      isSelected: true,
      width: '155px',
    },
    {
      key: 'Изменено',
      field: 'modifiedAt',
      type: 'date',
      filterType: 'date',
      isSelected: true,
    },
  ]
}

