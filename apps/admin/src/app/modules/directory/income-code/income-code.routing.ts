import { Routes } from "@angular/router";
import { ngxPermissionsGuard } from "ngx-permissions";
import { ComponentGuard } from "@core/guards/component.guard";

export const IncomeCodeRouting: Routes = [
  {
    path: '',
    loadComponent: (): any => import('./income-code.component').then(m => m.IncomeCodeComponent),
  },
  {
    path: 'new',
    loadComponent: (): any => import('./income-code-edit/income-code-edit.component').then(c => c.IncomeCodeEditComponent),
    canActivate: [ngxPermissionsGuard],
    data: {
      breadcrumb: 'Добавление',
      permissions: {
        only: 'MerchantGovernmentIncomeCreate',
        redirectTo: '/access-denied'
      }
    }
  },
  {
    path: 'edit/:id',
    loadComponent: (): any => import('./income-code-edit/income-code-edit.component').then(c => c.IncomeCodeEditComponent),
    canActivate: [ngxPermissionsGuard],
    canDeactivate: [ComponentGuard],
    data: {
      breadcrumb: 'Редактирование',
      permissions: {
        only: 'MerchantGovernmentIncomeUpdate',
        redirectTo: '/access-denied'
      }
    }
  },
]
