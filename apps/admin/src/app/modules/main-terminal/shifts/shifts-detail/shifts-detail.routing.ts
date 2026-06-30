import { Routes } from "@angular/router";
import { NgxPermissionsGuard } from "ngx-permissions";

export const SHIFTS_DETAIL_ROUTING: Routes = [
  {
    path: '',
    loadComponent: (): any => import('./shifts-detail.component').then(c => c.ShiftsDetailComponent),
    children: [
      {
        path: 'info',
        loadComponent: (): any => import('./shifts-info/shifts-info.component').then(c => c.ShiftsInfoComponent),
        canActivate: [NgxPermissionsGuard],
        data: {
          breadcrumb: 'Информация',
          permissions: {
            only: 'ShiftDetail',
            redirectTo: '/access-denied'
          }
        }
      },
    ]
  }
]
