import { Routes } from '@angular/router';
import { ngxPermissionsGuard } from 'ngx-permissions';
import { PermissionRedirectGuard } from "@core/guards/permission-redirect.guard";

export const PAYMENT_DETAIL_ROUTING: Routes = [
  {
    path: '',
    loadComponent: (): any => import('./payment-detail.component').then(c => c.PaymentDetailComponent),
    data: {
      breadcrumb: 'Детальный просмотр'
    },
    children: [
      {
        path: '',
        redirectTo: 'payment-history',
        pathMatch: 'full'
      },
      {
        path: 'payment-childs',
        loadComponent: (): any => import('./payment-child/payment-child.component').then(c => c.PaymentChildComponent),
        canActivate: [ngxPermissionsGuard],
        data: {
          breadcrumb: {skip: true},
          permissions: {
            only: 'PaymentChildList',
            redirectTo: 'payment-info',
            pathMatch: 'full'
          }
        },
      },
      {
        path: 'payment-history',
        loadComponent: (): any => import('./payment-history/payment-history.component').then(c => c.PaymentHistoryComponent),
        canActivate: [PermissionRedirectGuard],
        data: {
          breadcrumb: {skip: true},
          permissionKey: 'PaymentHistoryList',
          redirectTo: 'payment-childs'
        },
      },
      {
        path: 'payment-info',
        loadComponent: (): any => import('./payment-info/payment-info.component').then(c => c.PaymentInfoComponent),
        canActivate: [ngxPermissionsGuard],
        data: {
          breadcrumb: {skip: true},
          permissions: {
            only: 'PaymentDetail',
            redirectTo: 'payment-history',
            pathMatch: 'full'
          }
        }
      },
      {
        path: 'payment-child-info',
        loadComponent: (): any => import('./payment-child/payment-child-info/payment-child-info.component').then(c => c.PaymentChildInfoComponent),
        data: {
          breadcrumb: {skip: true},
        }
      }
    ]
  },
]
