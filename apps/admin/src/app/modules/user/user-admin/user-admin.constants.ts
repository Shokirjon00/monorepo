import { ICaption, IRowAction } from "@core/interfaces/table.interface";
import { TableRowActionEnum } from "@core/enums/table";
import { ITab } from "@core/interfaces/header.interface";
import { IAction } from "@shared/components/actions/actions.interface";
import { ActionEnum } from "@core/enums/action-enum";
import {MatchMode} from "@core/enums/match-mode.enum";

export class UserAdminConstants {

  static readonly USER_ADMIN_COLUMNS : ICaption[] = [
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
      width: '200px',
    },
    {
      key: 'Логин',
      field: 'userName',
      type: 'text',
      filterType: 'text',
      isSelected: true,
      width: '200px',
    },
    {
      key: 'Роль',
      field: 'roleName',
      type: 'text',
      filterType: 'text',
      isSortable: true,
      isSelected: true,
      width: '200px',
    },
    {
      key: 'ФИО',
      field: 'fullName',
      type: 'text',
      filterType: 'text',
      isSelected: true,
      width: '200px',
    },
    {
      key: 'Филиал',
      field: 'branchName',
      type: 'text',
      filterType: 'text',
      isSelected: true,
      isSortable: true,
      isFiltered: true,
      width: '200px',
    },
    {
      key: 'Номер телефона',
      field: 'phoneNumber',
      type: 'text',
      filterType: 'text',
      isSelected: true,
      width: '200px',
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

  static readonly USER_ADMIN_ACTIONS: IAction[] = [
    {
      code: ActionEnum.ADD,
      tooltipName: 'Добавить администратора',
      name: 'Добавить администратора',
      path: 'user/admin/new',
      permissionName: 'AdminUserCreate'
    },
    {
      code: ActionEnum.EXPORT,
      tooltipName: 'Экспорт',
      name: 'Экспорт',
      path: 'admin_users/report',
      permissionName: 'AdminUserExportToExcel'
    },
  ];

  static readonly TABLE_ACTIONS: IRowAction[] = [
    {
      type: TableRowActionEnum.EDIT,
      permissionName: 'AdminUserUpdate',
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

