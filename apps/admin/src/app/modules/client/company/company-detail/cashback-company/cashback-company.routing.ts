import { Routes } from '@angular/router';
import { ComponentGuard } from '@core/guards/component.guard';
import { ngxPermissionsGuard } from 'ngx-permissions';

export const CASHBACK_COMPANY_ROUTING: Routes = [
  {
    path: '',
    loadComponent: (): any => import('./cashback-company.component').then(c => c.CashbackCompanyComponent),
  },
  {
    path: 'new',
    loadComponent: (): any => import('./cashback-company-edit/cashback-company-edit.component').then(c => c.CashbackCompanyEditComponent),
    canActivate: [ngxPermissionsGuard],
    data: {
      breadcrumb: 'Добавление',
      permissions: {
        only: 'CashbackCompanyCreate',
        redirectTo: '/access-denied'
      }
    }
  },
  {
    path: 'edit/:id',
    loadComponent: (): any =>import('./cashback-company-edit/cashback-company-edit.component').then(c => c.CashbackCompanyEditComponent),
    canDeactivate: [ComponentGuard],
    canActivate: [ngxPermissionsGuard],
    data: {
      breadcrumb: 'Редактирование',
      permissions: {
        only: 'CashbackCompanyUpdate',
        redirectTo: '/access-denied'
      }
    }
  },
  {
    path: 'info/:id',
    loadComponent: (): any =>import('./cashback-company-info/cashback-company-info.component').then(c => c.CashbackCompanyInfoComponent),
    canActivate: [ngxPermissionsGuard],
    data: {
      breadcrumb: 'Информация',
      permissions: {
        only: 'CashbackCompanyDetail',
        redirectTo: '/access-denied'
      }
    }
  },
]
