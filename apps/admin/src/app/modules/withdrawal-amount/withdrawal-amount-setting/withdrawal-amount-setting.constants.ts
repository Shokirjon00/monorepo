import { IAction } from "@shared/components/actions/actions.interface";
import { ActionEnum } from "@core/enums/action-enum";
import { ICaption, IRowAction } from "@core/interfaces";
import { TableRowActionEnum } from "@core/enums/table";
import { ITab } from "@core/interfaces/header.interface";

export class WithdrawalAmountSettingConstants {

  static readonly WITHDRAWAL_AMOUNT_SETTING_ACTION: IAction[] = [
    {
      code: ActionEnum.ADD,
      tooltipName: 'Добавить новые настройки',
      path: 'withdrawal-amount/setting/new',
      permissionName: 'IssueMoneySettingCreate'
    },
  ];

  static readonly TABLE_ACTIONS: IRowAction[] = [
    {
      type: TableRowActionEnum.EDIT,
      permissionName: 'IssueMoneySettingUpdate',
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

  static readonly WITHDRAWAL_AMOUNT_SETTING_COLUMNS: ICaption[] = [
    {
      key: 'Статус',
      field: 'isActive',
      type: 'status-indicator',
      filterType: 'text',
      isFiltered: true,
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
  ]
}

