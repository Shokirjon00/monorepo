import { Routes } from "@angular/router";
import { ngxPermissionsGuard } from "ngx-permissions";

export const OrderHistoryRouting: Routes = [
  {
    path: '',
    loadComponent: (): any => import('./history.component').then(m => m.HistoryComponent)
  },
  {
    path: 'info/:id',
    loadComponent: (): any =>import('./history-info/history-info.component').then(c => c.HistoryInfoComponent),
    canActivate: [ngxPermissionsGuard],
    data: {
      breadcrumb: 'История заказа',
      permissions: {
        only: '',
        redirectTo: '/access-denied'
      }
    }
  },
]
