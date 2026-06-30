import { Routes } from '@angular/router';

export const ORDERS: Routes = [
  {
    path: '',
    loadComponent: (): any => import('./order.component').then(c => c.OrderComponent),
  },
  {
    path: 'detail/:id',
    loadChildren: (): any => import('./order-detail/order-detail.routing').then(m => m.orderDetailRoutes),
    data: {
      breadcrumb: 'Детальный просмотр'
    }
  }
]
