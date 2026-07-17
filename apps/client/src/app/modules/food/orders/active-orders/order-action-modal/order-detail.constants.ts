import { OrderActionButton } from "@modules/food/orders/active-orders/interfaces/order.interface";

export const ORDER_STATUSES =  [
  { name: 'NEW', label: 'Новый' },
  { name: 'IN_PROCESS', label: 'В работе' },
  { name: 'READY', label: 'Готов' },
  { name: 'DELIVERING', label: 'В доставке' },
  { name: 'COMPLETED', label: 'Завершён' }
];

export const ORDER_ACTION_BUTTONS: OrderActionButton[] = [
  {
    condition: (o) =>
      o.orderStatusGroup.name === 'NEW' &&
      o.orderStatus.name === 'CONFIRMED',
    action: 'accept',
    label: 'Принять заказ',
    class: 'btn-primary',
    permissionName: 'FoodVendorOrderAccept'
  },
  {
    condition: (o) => o.orderStatusGroup.name === 'IN_PROCESS',
    action: 'ready',
    label: 'Заказ готов',
    class: 'btn-primary',
    permissionName: 'FoodVendorOrderStatusReady'
  },
  {
    condition: (o) => o.orderStatusGroup.name === 'DELIVERING',
    action: 'complete',
    label: (o) => (o.deliveryAddress !== null ? 'Доставлено' : 'Завершён'),
    class: 'btn-primary',
    permissionName: 'FoodVendorOrderStatusComplete'
  },
  {
    condition: (o) => o.orderStatusGroup.name === 'READY' && o.deliveryAddress,
    action: 'deliver',
    label: 'Передать курьеру',
    class: 'btn-primary',
    permissionName: 'FoodVendorOrderStatusDelivery'
  },
  {
    condition: (o) => o.orderStatusGroup.name === 'READY' && !o.deliveryAddress,
    action: 'complete',
    label: 'Завершён',
    class: 'btn-primary',
    permissionName: 'FoodVendorOrderStatusComplete'
  }
];
