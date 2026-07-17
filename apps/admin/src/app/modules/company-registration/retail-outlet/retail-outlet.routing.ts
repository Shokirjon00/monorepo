import { Routes } from '@angular/router';

export const RETAIL_OUTING: Routes = [
  {
    path: '',
    loadComponent: (): any => import ('./retail-outlet.component').then(c => c.RetailOutletComponent),
    data: {
      breadcrumb: 'Торговые точки',
    },
  },
  {
    path: 'edit/:id',
    loadComponent: (): any => import ('./retail-outlet-detail/retail-outlet-dialog/retail-outlet-dialog.component').then(c => c.RetailOutletDialogComponent),
    data: {
      breadcrumb: 'Редактирование',
      permissions: {
        only: 'CompanyRegistrationApplicationUpdate'
      }
    }
  },
  {
    path: 'detail/:id',
    loadChildren: (): any => import('./retail-outlet-detail/retail-outlet-detail.routing').then(m => m.REGISTRATION_DETAIL_ROUTING),
    data: {
      breadcrumb : 'Просмотр'
    }
  },
]
