import { Routes } from "@angular/router";
import { ngxPermissionsGuard } from "ngx-permissions";

export const AllowListRouting: Routes = [
  {
    path: '',
    loadComponent:(): any => import('./allow-list.component').then(m => m.AllowListComponent),
  },
  {
    path: 'new',
    loadComponent: (): any => import('./allow-list-edit/allow-list-edit.component').then(c => c.AllowListEditComponent),
    canActivate: [ngxPermissionsGuard],
    data: {
      breadcrumb: 'Добавление',
      permissions: {
        only: 'AdvancePayoutOfferCreate',
        redirectTo: '/access-denied'
      }
    }
  },
  {
    path: 'edit/:id',
    loadComponent: (): any => import('./allow-list-edit/allow-list-edit.component').then(c => c.AllowListEditComponent),
    canActivate: [ngxPermissionsGuard],
    data: {
      breadcrumb: 'Редактирование',
      permissions: {
        only: 'AdvancePayoutOfferUpdate',
        redirectTo: '/access-denied'
      }
    }
  },
  {
    path: 'info/:id',
    loadComponent: (): any =>import('./allow-list-info/allow-list-info.component').then(c => c.AllowListInfoComponent),
    canActivate: [ngxPermissionsGuard],
    data: {
      breadcrumb: 'Информация',
      permissions: {
        only: 'AdvancePayoutOfferDetail',
        redirectTo: '/access-denied'
      }
    }
  }
]
