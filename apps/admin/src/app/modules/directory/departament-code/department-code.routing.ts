import { Routes } from "@angular/router";
import { ngxPermissionsGuard } from "ngx-permissions";
import { ComponentGuard } from "@core/guards/component.guard";

export const DEPARTMENT_CODE_ROUTING: Routes = [
  {
    path: '',
    loadComponent: (): any => import('./department-code.component').then(c => c.DepartmentCodeComponent),
  },
  {
    path: 'new',
    loadComponent: (): any => import('./department-code-edit/department-code-edit.component').then(c => c.DepartmentCodeEditComponent),
    canActivate: [ngxPermissionsGuard],
    data: {
      breadcrumb: 'Добавление',
      permissions: {
        only: 'MerchantGovernmentDepartmentCreate',
        redirectTo: '/access-denied'
      }
    }
  },
  {
    path: 'edit/:id',
    loadComponent: (): any => import('./department-code-edit/department-code-edit.component').then(c => c.DepartmentCodeEditComponent),
    canActivate: [ngxPermissionsGuard],
    canDeactivate: [ComponentGuard],
    data: {
      breadcrumb: 'Редактирование',
      permissions: {
        only: 'MerchantGovernmentDepartmentUpdate',
        redirectTo: '/access-denied'
      }
    }
  },
];
