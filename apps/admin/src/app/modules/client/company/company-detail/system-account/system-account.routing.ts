import { Routes } from '@angular/router';

export const SYSTEM_ACCOUNT_ROUTES: Routes = [
  {
    path: '',
    loadComponent: (): any =>import('./system-account.component').then(c => c.SystemAccountComponent),
  },
  {
    path: ':accountId',
    loadComponent: (): any =>import('../account/account-history/account-history.component').then(c => c.AccountHistoryComponent),
    data: {
      breadcrumb: 'Редактирование',
    }
  },
]
