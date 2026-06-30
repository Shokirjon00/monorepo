import { Routes } from '@angular/router';
import { ngxPermissionsGuard } from "ngx-permissions";


export const WITHDRAWAL_AMOUNT_ROUTING: Routes = [
  {
    path: '',
    loadComponent: (): any => import('./withdrawal-amount.component').then(m => m.WithdrawalAmountComponent),
    children: [
      {
        path: '',
        redirectTo: 'info',
        pathMatch: 'full'
      },
      {
        path: 'info',
        loadChildren: (): any => import('./withdrawal-amount-info/withdrawal-amount-info.routing').then(m => m.WITHDRAWAL_AMOUNT_INFO_ROUTING),
        canActivate: [ngxPermissionsGuard],
        data: {
          breadcrumb: 'Реестр вывода средств',
          permissions: {
            only: 'IssueMoneyRegistryList',
            redirectTo: '/access-denied'
          }
        }
      },
      {
        path: 'setting',
        loadChildren: (): any => import('./withdrawal-amount-setting/withdrawal-amount-setting.routing').then(m => m.WITHDRAWAL_AMOUNT_SETTING_ROUTER),
        canActivate: [ngxPermissionsGuard],
        data: {
          breadcrumb: 'Настройки вывода',
          permissions: {
            only: 'IssueMoneySettingUpdate',
            redirectTo: '/access-denied'
          }
        }
      }
    ],
  },
]
