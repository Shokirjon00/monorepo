import { Routes } from "@angular/router";
import { ngxPermissionsGuard } from "ngx-permissions";

export const SupportCenterRouting: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'all',
  },
  {
    path: ':type',
    loadComponent:(): any=> import('./support-center.component').then((c) => c.SupportCenterComponent),
  },
  {
    path: 'info/:id',
    loadComponent: (): any =>import('./support-center-info/support-center-info.component').then(c => c.SupportCenterInfoComponent),
    canActivate: [ngxPermissionsGuard],
    data: {
      breadcrumb: 'Информация',
      permissions: {
        only: 'SupportApplicationDetail',
        redirectTo: '/access-denied'
      }
    }
  }
]
