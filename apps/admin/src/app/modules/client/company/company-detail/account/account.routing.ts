import {Routes} from '@angular/router';

export const ACCOUNT_ROUTES: Routes = [
  {
    path: '',
    loadComponent: (): any =>import('./account.component').then(c => c.AccountComponent),
  },
  {
    path: ':accountId',
    loadComponent: (): any =>import('./account-history/account-history.component').then(c => c.AccountHistoryComponent),
    data: {
      breadcrumb: 'Редактирование',
    }
  },
]
