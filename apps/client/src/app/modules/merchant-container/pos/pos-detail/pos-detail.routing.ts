import { Routes } from "@angular/router";
import { ngxPermissionsGuard } from "ngx-permissions";
import { ComponentGuard } from "@core/guards/component.guard";

export const POS_CONTAINER_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pos-detail.component').then(m => m.PosDetailComponent),
    data: {breadcrumb: {skip: true}},
    children: [
      {
        path: 'info',
        loadComponent: () => import('./pos-info/pos-info.component').then(m => m.PosInfoComponent),
        canActivate: [ngxPermissionsGuard],
        data: {
          breadcrumb: 'Информация',
          permissions: {
            only: 'PosDetail',
            redirectTo: '/access-denied'
          }
        }
      },
      {
        path: 'edit',
        loadComponent: () => import('./pos-edit/pos-edit.component').then(m => m.PosEditComponent),
        canDeactivate: [ComponentGuard],
        canActivate: [ngxPermissionsGuard],
        data: {
          breadcrumb: 'Редактирование',
          permissions: {
            only: 'PosUpdate',
            redirectTo: '/access-denied'
          }
        }
      },
    ]
  }
]
