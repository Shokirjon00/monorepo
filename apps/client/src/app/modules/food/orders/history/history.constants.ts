import { ICaption } from '@core/interfaces/table1.interface';
import { ITab } from '@core/interfaces';
import { MatchMode } from '@core/enums/match-mode.enum';
import { environment as env } from '@environments/environment';

export class HistoryConstants {
  static readonly HISTORY_COLUMNS: ICaption[] = [
    { key: '№', field: 'sequence', mode: MatchMode.equal, filterType: 'number', type: 'number', isSelected: true },
    {
      key: 'Статус',
      field: 'orderStatus.value',
      apiUrl: `${env.apiFoodUrl}/${env.api.dictionaries}/${env.api.orderStatuses}`,
      mode: MatchMode.equal,
      filterParams: 'orderStatus',
      filterType: 'dropdown',
      type: 'text',
      isFiltered: true,
      isSelected: true,
      width: '155px',
    },
    {
      key: 'Точка Обслуживания',
      field: 'restaurantPointName',
      mode: MatchMode.containsLike,
      filterType: 'text',
      type: 'text',
      isSelected: true,
    },
    {
      key: 'Тип Обслуживания',
      field: 'deliveryTypeName',
      mode: MatchMode.containsLike,
      filterType: 'text',
      type: 'text',
      isSelected: true,
    },
    {
      key: 'Номер клиента',
      field: 'username',
      filterType: 'text',
      mode: MatchMode.containsLike,
      type: 'text',
      isSelected: true,
    },
    {
      key: 'Сумма Заказа',
      field: 'totalPrice.amount',
      filterType: 'number',
      filterParams: 'totalPrice',
      mode: MatchMode.equal,
      type: 'text',
      isFiltered: true,
      isSelected: true,
    },
    {
      key: 'Валюта',
      field: 'totalPrice.currencyCode',
      filterType: 'text',
      type: 'text',
      isSelected: true,
      isFiltered: true,
    },
    { key: 'Дата', field: 'createdDateTime', filterType: 'date', type: 'datetime', isSelected: true },
  ];

  static readonly HEADER_TABS: ITab[] = [
    {
      label: 'Активные',
      path: '/food/orders/active',
      permissionName: '',
    },
    {
      label: 'История',
      path: '/food/orders/history',
      permissionName: '',
    },
  ];

  static readonly HISTORY_INFO = [
    { label: 'Клиент:', value: (o: any) => o.createdByUser || '-' },
    { label: 'Номер Клиента:', value: (o: any) => o.username || '-' },
    { label: 'Адрес:', value: (o: any) => o.deliveryAddress || '-' },
    { label: 'Оплата:', value: (o: any) => o.paymentMethodName || '-' },
    { label: 'Статус оплаты:', value: (o: any) => o.orderStatus.value },
    { label: 'Дата заказа:', value: (o: any) => o.createdDateTime, isDate: true },
    { label: 'Комментарии:', value: (o: any) => o.comment || '-' },
  ];
}
