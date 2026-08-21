import { IRowAction, ITab } from "@core/interfaces";
import { TableRowActionEnum } from '@eskhata/util';
import { IAction } from '@eskhata/util';
import { ActionEnum } from '@eskhata/util';
import { ICaption } from '@eskhata/util';

export class PosTerminalConstants {

  static readonly POS_TERMINAL_COLUMNS : ICaption[] = [
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
      key: 'Логин',
      field: 'userName',
      type: 'text',
      filterType: 'text',
      isSelected: true,
      width: '150px',
    },
    {
      key: 'ФИО',
      field: 'fullName',
      type: 'text',
      filterType: 'text',
      isSelected: true,
      width: '250px',
    },
    {
      key: 'Роль',
      field: 'roleName',
      type: 'text',
      filterType: 'text',
      isSortable: true,
      isSelected: true,
      width: '150px',
    },
    {
      key: 'Номер телефона',
      field: 'phoneNumber',
      type: 'text',
      filterType: 'text',
      isSelected: true,
      width: '150px',
    },
    {
      key: 'Email',
      field: 'email',
      type: 'text',
      filterType: 'text',
      isSelected: true,
      width: '150px',
    },
  ];

  static readonly TABLE_ACTIONS: IRowAction[] = [
    {
      type: TableRowActionEnum.EDIT,
      permissionName: 'PosTerminalUserUpdate',
      iconUrl: 'icons/pen.svg',
    }
  ];

  static readonly ACTIONS: IAction[] = [
    {
      code: ActionEnum.ADD,
      tooltipName: 'Добавить',
      name: 'Добавить Pos-терминал',
      path: 'user/pos-terminal/new',
      permissionName: 'PosTerminalUserCreate'
    },
  ];

  static readonly HEADER_TABS: ITab[] = [
    {
      label: 'Личный кабинет',
      path: '/user/user',
      permissionName: 'UserList'
    },
    {
      label: 'Pos-терминал',
      path: '/user/pos-terminal',
      permissionName: 'PosTerminalUserList'
    }
  ]
}
