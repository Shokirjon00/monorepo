import { Routes } from '@angular/router';
import { NgxPermissionsGuard } from 'ngx-permissions';

export const POS_TERMINAL_ROUTING: Routes = [
  {
    path: '',
    loadComponent: (): any => import('./pos-terminal.component').then(c => c.PosTerminalComponent),

  },
  {
    path: 'new',
    loadComponent: (): any => import('./pos-terminal-edit/pos-terminal-edit.component').then(c => c.PosTerminalEditComponent),
    canActivate: [NgxPermissionsGuard],
    data: {
      breadcrumb: 'Добавление',
      permissions: {
        only: 'PosTerminalUserDeviceCreate',
        redirectTo: '/access-denied'
      }
    }
  },
  {
    path: ':posTerminalId',
    loadChildren: (): any => import('./pos-terminal-detail/pos-terminal-detail.routing').then(m => m.POS_TERMINAL_DETAIL_ROUTING),
    data: {breadcrumb: {skip: true}},
  }
];
