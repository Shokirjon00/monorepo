import { Routes } from '@angular/router';

export const LIST_REGISTRATION: Routes = [
  {
    path: '',
    loadComponent: (): any => import ('./list-registration.component').then(c => c.ListRegistrationComponent),
    data: {breadcrumb: {skip: true}},
  },
  {
    path: 'edit/:id',
    loadComponent: (): any => import ('./list-registration-detail/list-registration-edit/list-registration-edit.component').then(c => c.ListRegistrationEditComponent),
    data: {
      breadcrumb: 'Редактирование',
      permissions: {
        only: 'CompanyRegistrationApplicationUpdate'
      }
    }
  },
  {
    path: 'detail/:id',
    loadChildren: (): any => import('./list-registration-detail/list-registration-detail.routing').then(m => m.REGISTRATION_DETAIL_ROUTING),
    data: {
      breadcrumb : 'Просмотр'
    }
  },
]
