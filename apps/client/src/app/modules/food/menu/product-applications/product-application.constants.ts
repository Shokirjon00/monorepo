import { ICaption } from "@core/interfaces/table1.interface";
import { IOptionAction, IRowAction, ITab } from "@core/interfaces";
import { IAction } from "@shared/components/actions/action.interface";
import { ActionEnum } from "@core/enums/action-enum";
import { TableRowActionEnum } from "@core/enums/table";
import { MatchMode } from "@core/enums/match-mode.enum";
import { environment as env } from "@environments/environment";

export class ProductApplicationConstants {

  static readonly PRODUCT_COLUMNS: ICaption[] = [
    {
      key: 'ID',
      field: 'id',
      type: 'text',
      filterType: 'text',
      isFiltered: false,
      isSelected: true,
      mode: MatchMode.equal,
      width: "150px",
    },
    {
      key: 'Название',
      field: 'productName',
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
      key: 'Тип заявки',
      field: 'productApplicationType.value',
      type: 'text',
      filterType: 'dropdown',
      filterParams: 'productApplicationType',
      isFiltered: false,
      isSelected: true,
      mode: MatchMode.equal,
      width: "150px",
      apiUrl: `${env.apiFoodUrl}/${env.api.dictionaries}/${env.api.foodProductApplicationsType}`
    },
    {
      key: 'Дата',
      field: 'createdDateTime',
      type: 'datetime',
      isSelected: true,
      filterType: 'date',
      width: "200px",
    },
  ]

  static readonly HEADER_TABS: ITab[] = [
    {
      label: 'Активные',
      path: '/food/food-menu/products',
      permissionName: 'FoodVendorMenuList'
    },
    {
      label: 'На модерации',
      path: '/food/food-menu/in-review',
      permissionName: 'FoodVendorMenuApplicationList'
    },
    {
      label: 'Отклоненые',
      path: '/food/food-menu/rejected',
      permissionName: 'FoodVendorMenuApplicationList'
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
      permissionName: 'FoodVendorMenuApplicationUpdate',
      text: 'Редактировать'
    }
  ];
}
