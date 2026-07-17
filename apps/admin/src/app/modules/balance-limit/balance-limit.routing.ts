import { Routes } from '@angular/router';
import { ngxPermissionsGuard } from "ngx-permissions";

export const BALANCE_LIMIT: Routes = [
  {
    path: '',
    loadComponent: (): any => import('./balance-limit.component').then(m => m.BalanceLimitComponent),
    children: [
      {
        path: '',
        redirectTo: 'ift',
        pathMatch: 'full'
      },
      {
        path: 'ift',
        loadComponent: (): any => import('./balance-limit-ift/balance-limit-ift.component').then(m => m.BalanceLimitIftComponent),
        canActivate: [ngxPermissionsGuard],
        data: {
          breadcrumb: 'Счета IFT',
          permissions: {
            only: 'IFTLimitDetail',
            redirectTo: 'balance-limit/list',
            pathMatch: 'full'
          }
        }
      },
      {
        path: 'list',
        loadComponent: (): any => import('./balance-limit-list/balance-limit-list.component').then(m => m.BalanceLimitListComponent),
        canActivate: [ngxPermissionsGuard],
        data: {
          permissions: {
            only: 'MerchantLimitList',
            redirectTo: '/access-denied',
            pathMatch: 'full'
          }
        }
      },
      {
        path: 'new',
        loadComponent: (): any => import('./balance-limit-edit/balance-limit-edit.component').then(m => m.BalanceLimitEditComponent),
        data: {
          breadcrumb: 'Добавление'
        }
      },
      {
        path: 'edit/:id',
        loadComponent: (): any => import('./balance-limit-edit/balance-limit-edit.component').then(m => m.BalanceLimitEditComponent),
        data: {
          breadcrumb: 'Редактирование',
        }
      }
    ]
  },
];
