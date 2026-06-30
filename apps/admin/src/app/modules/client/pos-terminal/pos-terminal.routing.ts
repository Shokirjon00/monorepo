import { Routes } from "@angular/router";
import { ngxPermissionsGuard } from "ngx-permissions";

export const POS_TERMINAL_ROUTES: Routes = [
  {
    path: '',
    loadComponent: (): any => import('./pos-terminal.component').then(c => c.PosTerminalComponent),
  },
  {
    path: 'new',
    loadComponent: (): any => import('./pos-terminal-edit/pos-terminal-edit.component').then(c => c.PosTerminalEditComponent),
    canActivate: [ngxPermissionsGuard],
    data: {
      breadcrumb: 'Добавление',
      permissions: {
        only: 'PosTerminalCreate',
        redirectTo: '/access-denied'
      }
    }
  },
  {
    path: ':posTerminalId',
    loadChildren: (): any => import('./pos-terminal-detail/pos-terminal-detail.routing').then(m => m.POS_TERMINAL_DETAIL_ROUTING),
    data: {breadcrumb: {skip: true}}
  }
]
