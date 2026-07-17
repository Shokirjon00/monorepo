import { ICaption } from "@core/interfaces/table.interface";
import { ITab } from "@core/interfaces/header.interface";

export class UserClientLogConstants {

  static readonly USER_CLIENT_LOG_COLUMNS : ICaption[] = [
    {
      key: 'ID',
      field: 'id',
      type: 'text',
      filterType: 'text',
      isSelected: true,
      width: '200px',
    },
    {
      key: 'IP',
      field: 'ip',
      type: 'text',
      filterType: 'text',
      isSelected: true,
      width: '200px',
    },
    {
      key: 'Браузер',
      field: 'userAgent',
      type: 'text',
      filterType: 'text',
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
      key: 'Путь запроса',
      field: 'userActivityTypeName',
      type: 'text',
      filterType: 'text',
      isSelected: true,
      width: '200px',
    },
    {
      key: 'Дата запроса',
      field: 'createdAt',
      type: 'datetime',
      filterType: 'date',
      isSelected: true,
      width: '200px',
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

