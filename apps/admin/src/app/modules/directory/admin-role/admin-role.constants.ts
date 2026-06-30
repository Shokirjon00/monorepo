import { ICaption, IRowAction } from "@core/interfaces";
import { TableRowActionEnum } from "@core/enums/table";
import { IAction } from "@shared/components/actions/actions.interface";
import { ActionEnum } from "@core/enums/action-enum";
import { MatchMode } from "@core/enums/match-mode.enum";

export class AdminRoleConstants {

  static readonly ADMINROLE_COLUMNS : ICaption[] = [
    {
      key: 'Статус',
      field: 'isActive',
      type: 'status-indicator',
      filterType: 'list',
      mode: MatchMode.equalsOnly,
      isFiltered: false,
      isSelected: true,
      width: '155px',
    },
    {
      key: 'Наименование',
      field: 'name',
      type: 'text',
      filterType: 'text',
      isSelected: true,
      width: '200px',
    },
    {
      key: 'Описание',
      field: 'description',
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

  static readonly TABLE_ACTIONS: IRowAction[] = [
    {
      type: TableRowActionEnum.EDIT,
      permissionName: 'AdminUserRoleUpdate',
      iconUrl: 'icons/pen.svg',
    }
  ]

  static readonly ADMIN_ROLE_ACTIONS: IAction[] = [
    {
      code: ActionEnum.ADD,
      tooltipName: 'Добавить роль админа',
      permissionName: 'AdminUserRoleCreate',
      path: 'directory/admin-roles/new'
    },
    {
      code: ActionEnum.EXPORT,
      tooltipName: 'Экспорт',
      permissionName: 'AdminUserRoleExportToExcel',
      path: 'admin_user_roles/report'
    },
  ];
}
