import { Routes } from '@angular/router';
import { NgxPermissionsGuard } from 'ngx-permissions';

export const SupportCenterRouting: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'all',
  },
  {
    path: 'add',
    loadComponent: () => import('@modules/support-center/support-center-detail/support-center-add/support-center-add.component')
        .then((c) => c.SupportCenterAddComponent),
    canActivate: [NgxPermissionsGuard],
    data: {
      breadcrumb: 'Добавление',
      permissions: {
        only: 'SupportApplicationCreate',
        redirectTo: '/access-denied'
      }
    }
  },
  {
    path: 'detail/:id',
    loadComponent: () => import('@modules/support-center/support-center-detail/support-center-detail.component')
        .then((c) => c.SupportCenterDetailComponent),
    data: {breadcrumb: {skip: true}},
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'info'
      },
      {
        path: 'info',
        loadComponent: () => import('@modules/support-center/support-center-detail/support-center-info/support-center-info.component')
            .then((c) => c.SupportCenterInfoComponent),
        canActivate: [NgxPermissionsGuard],
        data: {
          breadcrumb: 'Информация',
          permissions: {
            only: 'SupportApplicationDetail',
            redirectTo: '/access-denied'
          }
        }
      }
    ]
  },
  {
    path: ':type',
    loadComponent:(): any=> import('./support-center.component').then((c) => c.SupportCenterComponent)
  }
]
