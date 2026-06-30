import { Routes } from '@angular/router';
import { NgxPermissionsGuard } from 'ngx-permissions';

export const ACTIVE_ORDERS: Routes = [
  {
    path: '',
    loadComponent: () => import('./active-orders.component').then(m => m.ActiveOrdersComponent),
    data: {
      breadcrumb: {skip: true},
      permissions: {
        only: 'FoodVendorOrderList',
        redirectTo: '/access-denied'
      }
    }
  },
  {
    path: 'info/:id',
    loadComponent: () => import('./order-action-modal/order-detail.component').then(m => m.OrderDetailComponent),
    canActivate: [NgxPermissionsGuard],
    data: {
      breadcrumb: 'Детальный просмотр',
      permissions: {
        only: 'FoodVendorOrderDetail',
        redirectTo: '/access-denied'
      }
    },
  }
]
