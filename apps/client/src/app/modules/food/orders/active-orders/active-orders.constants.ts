import { ICaption } from "@core/interfaces/table1.interface";
import { ITab } from "@core/interfaces";
import { MatchMode } from '@core/enums/match-mode.enum';
import { environment as env } from "@environments/environment";

export class ActiveOrdersConstants {

  static readonly ORDERS_COLUMNS: ICaption[] = [
    { key: '№', field: 'sequence', mode: MatchMode.equal, filterType: 'number', type: 'number', isSelected: true },
    { key: 'Статус', field: 'orderStatusGroup.value', apiUrl: `${env.apiFoodUrl}/${env.api.dictionaries}/${env.api.orderStatuses}`, mode: MatchMode.equal, filterParams: 'orderStatusGroup', filterType: 'dropdown', type: 'text', isFiltered: true, isSelected: true, width: '155px'},
    { key: 'Точка Обслуживания', field: 'restaurantPointName', mode: MatchMode.containsLike, filterType: 'text', type: 'text', isSelected: true },
    { key: 'Тип Обслуживания', field: 'deliveryTypeName', mode: MatchMode.containsLike, filterType: 'text', type: 'text', isSelected: true },
    { key: 'Номер клиента', field: 'username', filterType: 'text', mode: MatchMode.containsLike, type: 'text', isSelected: true },
    { key: 'Сумма Заказа', field: 'totalPrice.amount', filterType: 'number', filterParams: 'price', mode: MatchMode.equal, type: 'text', isFiltered: true, isSelected: true },
    { key: 'Валюта', field: 'totalPrice.currencyCode', filterType: 'text', type: 'text', isSelected: true, isFiltered: true },
    { key: 'Дата', field: 'createdDateTime', filterType: 'date', type: 'datetime', isSelected: true }
  ]

  static readonly HEADER_TABS: ITab[] = [
    {
      label: 'Активные',
      path: '/food/orders/active',
      permissionName: 'FoodVendorOrderList'
    },
    {
      label: 'История',
      path: '/food/orders/history',
      permissionName: 'FoodVendorOrderList'
    },
  ];

}
