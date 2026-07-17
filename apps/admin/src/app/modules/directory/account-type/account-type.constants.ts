import { ICaption, IRowAction } from "@core/interfaces";
import { TableRowActionEnum } from "@core/enums/table";
import { IAction } from "@shared/components/actions/actions.interface";
import { ActionEnum } from "@core/enums/action-enum";
import { environment as env } from "@environments/environment";
import { MatchMode } from '@core/enums/match-mode.enum';

export class AccountTypeConstants {

  static readonly ACCOUNTTYPE_COLUMNS : ICaption[] = [
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
      key: 'Наименование',
      field: 'name',
      type: 'text',
      filterType: 'text',
      isSelected: true,
      width: '250px',
    },
    {
      key: 'Шлюз',
      field: 'gatewayName',
      type: 'text',
      filterType: 'text',
      isSelected: true,
      width: '300px',
    },
    {
      key: 'Тип категории',
      field: 'accountCategoryTypesName',
      type: 'text',
      filterType: 'text',
      isSelected: true,
    },
    {
      key: 'Код счёта ABS',
      field: 'extCodeObjectAbs',
      type: 'text',
      filterType: 'text',
      isSelected: true,
    },
    {
      key: 'Классификация счёта',
      field: 'accountClassificationName',
      placeholder: 'Выберите классификацию',
      filterParams: 'accountClassificationId',
      type: 'text',
      filterType: 'search-dropdown',
      apiUrl: `${env.api.accountTypes}/${env.api.classifications}/${env.api.dictionary}`,
      isSelected: true,
      width: '155px'
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
      permissionName: 'AccountTypeUpdate',
      iconUrl: 'icons/pen.svg',
    }
  ]

  static readonly ACCOUNT_TYPE_ACTIONS: IAction[] = [
    {
      code: ActionEnum.ADD,
      tooltipName: 'Добавить тип счета',
      path: 'directory/account-type/new',
      permissionName: 'AccountTypeCreate',
    },
  ];

}
