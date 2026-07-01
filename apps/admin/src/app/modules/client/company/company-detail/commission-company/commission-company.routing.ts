import { Routes } from '@angular/router';
import { ngxPermissionsGuard } from "ngx-permissions";
import { ComponentGuard } from '@eskhata/util';

export const COMMISSION_COMPANY_ROUTING: Routes = [
  {
    path: '',
    loadComponent: (): any => import('./commission-company.component').then(c => c.CommissionCompanyComponent),
  },
  {
    path: 'new',
    loadComponent: (): any => import('@modules/client/company/company-detail/commission-company/commission-company-edit/commission-company-edit.component').then(c => c.CommissionCompanyEditComponent),
    canActivate: [ngxPermissionsGuard],
    data: {
      breadcrumb: 'Добавление',
      permissions: {
        only: 'CommissionCompanyCreate',
        redirectTo: '/access-denied'
      }
    }
  },
  {
    path: 'edit/:id',
    loadComponent: (): any =>import('@modules/client/company/company-detail/commission-company/commission-company-edit/commission-company-edit.component').then(c => c.CommissionCompanyEditComponent),
    canDeactivate: [ComponentGuard],
    canActivate: [ngxPermissionsGuard],
    data: {
      breadcrumb: 'Редактирование',
      permissions: {
        only: 'CommissionCompanyUpdate',
        redirectTo: '/access-denied'
      }
    }
  },
  {
    path: 'info/:id',
    loadComponent: (): any =>import('./commission-company-info/commission-company-info.component').then(c => c.CommissionCompanyInfoComponent),
    canActivate: [ngxPermissionsGuard],
    data: {
      breadcrumb: 'Информация',
      permissions: {
        only: 'CommissionCompanyDetail',
        redirectTo: '/access-denied'
      }
    }
  },
]
