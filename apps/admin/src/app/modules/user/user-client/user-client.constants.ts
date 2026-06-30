import { ICaption, IRowAction } from "@core/interfaces/table.interface";
import { TableRowActionEnum } from "@core/enums/table";
import { ITab } from "@core/interfaces/header.interface";
import { IAction } from "@shared/components/actions/actions.interface";
import { ActionEnum } from "@core/enums/action-enum";
import {MatchMode} from "@core/enums/match-mode.enum";

export class UserClientConstants {

  static readonly USER_CLIENT_COLUMNS : ICaption[] = [
    {
      key: 'Статус',
      field: 'isActive',
      type: 'status-indicator',
      filterType: 'list',
      mode: MatchMode.equalsOnly,
      isFiltered: false,
      isSelected: true,
      width: '150px',
    },
    {
      key: 'ID',
      field: 'id',
      type: 'text',
      filterType: 'text',
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
      key: 'Роль',
      field: 'roleName',
      type: 'text',
      filterType: 'text',
      isFiltered: true,
      isSortable: true,
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
      key: 'Организация',
      field: 'companyName',
      type: 'link',
      filterType: 'text',
      isSelected: true,
      width: '200px',
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
      key: 'Вход',
      field: 'lastLoginDateTime',
      type: 'datetime',
      filterType: 'date',
      isSelected: true,
      width: '200px',
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
    }
  ]

  static readonly USER_CLIENT_ACTIONS: IAction[] = [
    {
      code: ActionEnum.ADD,
      tooltipName: 'Добавить клиента',
      name: 'Добавить клиента',
      path: 'user/client/new',
      permissionName: 'ClientUserCreate'
    },
    {
      code: ActionEnum.EXPORT,
      tooltipName: 'Экспорт',
      name: 'Экспорт',
      path: 'client_users/report',
      permissionName: 'ClientUserExportToExcel'
    },
  ];

  static readonly TABLE_ACTIONS: IRowAction[] = [
    {
      type: TableRowActionEnum.EDIT,
      permissionName: 'ClientUserUpdate',
      iconUrl: 'icons/pen.svg',
    }
  ]

  static readonly HEADER_TABS: ITab[] = [
    {
      label: 'Администраторы',
      path: '/user/admin',
      permissionName: 'AdminUserList'
    },
    {
      label: 'Действия администраторов',
      path: '/user/admin-log',
      permissionName: 'AdminUserActivitiesList'
    },
    {
      label: 'Клиенты',
      path: '/user/client',
      permissionName: 'ClientUserList'
    },
    {
      label: 'Действия клиентов',
      path: '/user/client-log',
      permissionName: 'UserActivitiesList'
    },
    {
      label: 'История изменений',
      path: '/user/history-update',
      permissionName: 'AdminUserAuditTablesList'
    },
    {
      label: 'Пользователи',
      path: '/user/client-roles',
      permissionName: 'CountryList'
    },
    {
      label: 'Действия пользователей',
      path: '/user/users-log',
      permissionName: 'CountryList'
    },
    {
      label: 'Журнал изменений',
      path: '/user/users-history-update',
      permissionName: 'PosTerminalUserAuditTablesList'
    }
  ]
}

