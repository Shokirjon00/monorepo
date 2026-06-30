import { Routes } from '@angular/router';

export const POS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: (): any => import('./pos.component').then(c => c.PosComponent),
    data: {
      breadcrumb: {alias: 'posDetail'},
      showBreadcrumbs: false,
      showFilters: true
    },
  },
  {
    path: 'new',
    loadComponent: (): any => import('./pos-edit/pos-edit.component').then(c => c.PosEditComponent),
    data: {
      breadcrumb: 'Новая касса'
    }
  },
  {
    path: ':posId',
    loadChildren: (): any => import('./pos-detail/pos-detail.routing').then(m => m.POS_CONTAINER_ROUTES),
  },
]
