import {Routes} from '@angular/router';
import {ngxPermissionsGuard} from 'ngx-permissions';

export const PAYMENTS: Routes = [
  {
    path: '',
    loadComponent: (): any => import('./transactions.component').then(c => c.TransactionsComponent),
    children: [
      {
        path: '',
        redirectTo: 'payments',
        pathMatch: 'full'
      },
      {
        path: 'payments',
        loadChildren: (): any => import('./payments/payments.routing').then(m => m.PAYMENTS_ROUTES),
        canActivate: [ngxPermissionsGuard],
        data: {
          breadcrumb: 'Платежи',
          permissions: {
            only: 'PaymentList',
            redirectTo: '/access-denied'
          }
        }
      },
      {
        path: 'payment-without-child',
        loadComponent: (): any => import('./payment-without-child/payment-without-child.component').then(m => m.PaymentWithoutChildComponent),
        canActivate: [ngxPermissionsGuard],
        data: {
          breadcrumb: 'Все транзакции',
          permissions: {
            only: 'PaymentList',
            redirectTo: '/access-denied'
          }
        }
      }
    ]
  }
]
