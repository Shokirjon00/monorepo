import { Routes } from "@angular/router";
import { ngxPermissionsGuard } from "ngx-permissions";

export const POS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pos.component').then(m => m.PosComponent),
  },
  {
    path: 'new',
    loadComponent: () => import('./pos-detail/pos-edit/pos-edit.component').then(m => m.PosEditComponent),
    canActivate: [ngxPermissionsGuard],
    data: {
      breadcrumb: 'Добавление',
      permissions: {
        only: 'PosCreate',
        redirectTo: '/access-denied'
      }
    }
  },
  {
    path: ':posId',
    loadChildren: (): any => import('./pos-detail/pos-detail.routing').then(m => m.POS_CONTAINER_ROUTES),
  },
]
