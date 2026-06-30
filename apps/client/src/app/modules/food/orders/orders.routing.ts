import {Routes} from '@angular/router';
import { ngxPermissionsGuard, NgxPermissionsGuard } from "ngx-permissions";

export const ORDERS: Routes = [
  {
    path: '',
    loadComponent: () => import('./orders.component').then(m => m.OrdersComponent),
    children: [
      {
        path: '',
        redirectTo: 'active',
        pathMatch: 'full'
      },
      {
        path: 'active',
        loadChildren: () => import('./active-orders/active-orders.routing').then(m => m.ACTIVE_ORDERS),
        canActivate: [NgxPermissionsGuard],
        data: {
          breadcrumb: 'Заказы',
          permissions: {
            only: 'FoodVendorOrderList',
            redirectTo: '/access-denied'
          }
        }
      },
      {
        path: 'history',
        loadChildren: () => import('./history/history.routing').then(m => m.OrderHistoryRouting),
        canActivate: [ngxPermissionsGuard],
        data: {
          breadcrumb: 'История',
          permissions: {
            only: '',
            redirectTo: '/access-denied'
          }
        }
      }
    ]
  }
];

