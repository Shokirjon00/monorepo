import { IRowAction, ITab } from "@core/interfaces";
import { TableRowActionEnum } from "@core/enums/table";
import { IAction } from "@shared/components/actions/action.interface";
import { ActionEnum } from "@core/enums/action-enum";
import { ICaption } from "@core/interfaces/table1.interface";

export class UserConstants {

  static readonly USER_COLUMNS: ICaption[] = [
    {
      key: 'Статус',
      field: 'isActive',
      type: 'status-indicator',
      filterType: 'text',
      isFiltered: true,
      isSelected: true,
      width: "150px",
    },
    {
      key: 'Логин',
      field: 'userName',
      type: 'text',
      filterType: 'text',
      isSelected: true,
      width: "250px",
    },
    {
      key: 'ФИО',
      field: 'fullName',
      type: 'text',
      filterType: 'text',
      isSelected: true,
      width: "250px",
    },
    {
      key: 'Номер телефона',
      field: 'phoneNumber',
      type: 'text',
      filterType: 'text',
      isSelected: true,
      width: "150px",
    },
    {
      key: 'Email',
      field: 'email',
      type: 'text',
      filterType: 'text',
      isSelected: true,
    },
    {
      key: 'Роль',
      field: 'roles',
      type: 'text',
      filterType: 'text',
      isSortable: true,
      isSelected: true,
      width: "150px",
    }
  ];

  static readonly TABLE_ACTIONS: IRowAction[] = [
    {
      type: TableRowActionEnum.EDIT,
      permissionName: 'UserUpdate',
      iconUrl: 'icons/pen.svg',
    }
  ];

  static readonly ACTIONS: IAction[] = [
    {
      code: ActionEnum.ADD,
      tooltipName: 'Добавить',
      name: 'Добавить пользователя',
      path: 'user/user/new',
      permissionName: 'UserCreate'
    },
  ]

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
