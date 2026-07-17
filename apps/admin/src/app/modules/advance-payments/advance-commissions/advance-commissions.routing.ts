import { Routes } from "@angular/router";
import { ngxPermissionsGuard } from "ngx-permissions";

export const AdvanceCommissionsRouting: Routes = [
  {
    path: '',
    loadComponent: (): any => import('./advance-commissions.component').then(m => m.AdvanceCommissionsComponent),
  },
  {
    path: 'new',
    loadComponent: (): any =>import('./advance-commissions-edit/advance-commissions-edit.component').then(c => c.AdvanceCommissionsEditComponent),
    canActivate: [ngxPermissionsGuard],
    data: {
      breadcrumb: 'Добавление',
      permissions: {
        only: 'CommissionAdvanceCreate',
        redirectTo: '/access-denied'
      }
    }
  },
  {
    path: 'edit/:id',
    loadComponent: (): any =>import('./advance-commissions-edit/advance-commissions-edit.component').then(c => c.AdvanceCommissionsEditComponent),
    canActivate: [ngxPermissionsGuard],
    data: {
      breadcrumb: 'Редактирование',
      permissions: {
        only: 'CommissionAdvanceUpdate',
        redirectTo: '/access-denied'
      }
    }
  },
  {
    path: 'info/:id',
    loadComponent: (): any =>import('./advance-commissions-info/advance-commissions-info.component').then(c => c.AdvanceCommissionsInfoComponent),
    canActivate: [ngxPermissionsGuard],
    data: {
      breadcrumb: 'Информация',
      permissions: {
        only: 'CommissionAdvanceDetail',
        redirectTo: '/access-denied'
      }
    }
  },
]
