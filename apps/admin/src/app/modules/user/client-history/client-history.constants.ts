import { ICaption } from "@core/interfaces/table.interface";
import { ITab } from "@core/interfaces/header.interface";
import { IAction } from "@shared/components/actions/actions.interface";
import { ActionEnum } from "@core/enums/action-enum";
import { MatchMode } from "@core/enums/match-mode.enum";

export class ClientHistoryConstants {

  static readonly USER_CLIENT_HISTORY_COLUMNS : ICaption[] = [
    {
      key: 'Дата и время',
      field: 'createdAt',
      type: 'datetime',
      filterType: 'date',
      mode: MatchMode.equalsOnly,
      isSelected: true,
      width: '155px'
    },
    {
      key: 'Пользователь',
      field: 'fullname',
      type: 'text',
      filterType: 'text',
      isSelected: true,
      width: '200px',
    },
    {
      key: 'Таблица',
      field: 'tableName',
      type: 'text',
      filterType: 'text',
      isSelected: true,
      isSortable: true,
      width: '200px',
    },
    {
      key: 'Тип действия',
      field: 'type',
      type: 'text',
      filterType: 'action_type',
      isSelected: true,
      isSortable: true,
      isFiltered: false,
      mode: MatchMode.contains,
      width: '200px',
    }
  ]

  static readonly USER_CLIENT_ACTIONS: IAction[] = [
    {
      code: ActionEnum.EXPORT,
      tooltipName: 'Экспорт',
      path: 'user/history-update',
      permissionName: 'AdminUserAuditTablesExportToExcel'
    },
  ];

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
  ];
}

