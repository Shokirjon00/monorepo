import { Routes } from "@angular/router";
import { ngxPermissionsGuard } from "ngx-permissions";
import { ComponentGuard } from "@core/guards/component.guard";

export const APPEAL_CATEGORY_ROUTING: Routes = [
  {
    path: '',
    loadComponent: (): any => import('./appeal-category.component').then(c => c.AppealCategoryComponent),
    data: {breadcrumb: 'Категория обращений'}
  },
  {
    path: 'new',
    loadComponent: (): any => import('./appeal-category-edit/appeal-category-edit.component').then(c => c.AppealCategoryEditComponent),
    canActivate: [ngxPermissionsGuard],
    data: {
      breadcrumb: 'Добавление',
      permissions: {
        only: 'SupportApplicationCategoryCreate',
        redirectTo: '/access-denied'
      }
    }
  },
  {
    path: 'edit/:id',
    loadComponent: (): any => import('./appeal-category-edit/appeal-category-edit.component').then(c => c.AppealCategoryEditComponent),
    canActivate: [ngxPermissionsGuard],
    canDeactivate: [ComponentGuard],
    data: {
      breadcrumb: 'Редактирование',
      permissions: {
        only: 'SupportApplicationCategoryUpdate',
        redirectTo: '/access-denied'
      }
    }
  },
  {
    path: 'info/:id',
    loadComponent: (): any => import('./appeal-category-info/appeal-category-info.component').then(c => c.AppealCategoryInfoComponent),
    canActivate: [ngxPermissionsGuard],
    data: {
      breadcrumb: 'Информация',
      permissions: {
        only: 'SupportApplicationCategoryDetail',
        redirectTo: '/access-denied'
      }
    }
  },
];
