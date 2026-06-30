import { ICaption } from "@core/interfaces/table1.interface";
import { IOptionAction, IRowAction, ITab } from "@core/interfaces";
import { IAction } from "@shared/components/actions/action.interface";
import { ActionEnum } from "@core/enums/action-enum";
import { TableRowActionEnum } from "@core/enums/table";
import { MatchMode } from "@core/enums/match-mode.enum";

export class ProductConstants {

  static readonly PRODUCT_COLUMNS: ICaption[] = [
    {
      key: 'Статус',
      field: 'isActive',
      type: 'status-indicator',
      isSelected: true,
      isFiltered: false,
      mode: MatchMode.equal,
      filterType: 'list',
      width: "200px",
    },
    {
      key: 'ID',
      field: 'id',
      type: 'text',
      filterType: 'text',
      mode: MatchMode.equal,
      isFiltered: false,
      isSelected: true,
      width: "150px",
    },
    {
      key: 'Название',
      field: 'name',
      type: 'text',
      filterType: 'text',
      isFiltered: false,
      isSelected: true,
      mode: MatchMode.containsLike,
      width: "150px",
    },
    {
      key: 'Категория',
      field: 'categoryName',
      type: 'text',
      filterType: 'text',
      isFiltered: false,
      isSelected: true,
      mode: MatchMode.containsLike,
      width: "150px",
    },
    {
      key: 'Дата',
      field: 'createdDateTime',
      type: 'datetime',
      isSelected: true,
      isFiltered: false,
      filterType: 'date',
      width: "200px",
    },
  ]

  static readonly HEADER_TABS: ITab[] = [
    {
      label: 'Активные',
      path: '/food/food-menu/products',
      permissionName: ''
    },
    {
      label: 'На модерации',
      path: '/food/food-menu/in-review',
      permissionName: ''
    },
    {
      label: 'Отклоненые',
      path: '/food/food-menu/rejected',
      permissionName: ''
    },
  ];

  static readonly ACTION: IAction[] = [
    {
      code: ActionEnum.ADD,
      tooltipName: 'Добавить блюдо',
      path: '/food/food-menu/add',
      name: 'Добавить блюдо',
      permissionName: 'FoodVendorMenuApplicationCreate'
    }
  ]

  static readonly OPTION_ACTIONS: IOptionAction[] = [
    {
      type: TableRowActionEnum.EDIT,
      permissionName: 'FoodVendorMenuApplicationModify',
      text: 'Редактировать'
    },
    {
      type: TableRowActionEnum.CHANGE_STATUS,
      permissionName: 'FoodVendorMenuUpdate'
    }
  ];
}
