import { Routes } from '@angular/router';

export const ORDER_ROUTING: Routes = [
  {
    path: '',
    loadComponent: (): any => import('./order.component').then(m => m.OrderComponent),
  },
  {
    path: ':id',
    loadComponent: (): any => import('./order-info/order-info.component').then(c => c.OrderInfoComponent),
    data: {
      breadcrumb: 'Информация',
      permissions: {
        only: 'OrderDetail',
        redirectTo: '/access-denied',
      },
    },
  },
];
