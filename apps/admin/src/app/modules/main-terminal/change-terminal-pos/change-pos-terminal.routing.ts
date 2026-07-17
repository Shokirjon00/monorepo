import { Routes } from '@angular/router';
import { NgxPermissionsGuard } from 'ngx-permissions';

export const CHANGE_TERMINAL_POS_ROUTING: Routes = [
  {
    path: '',
    loadComponent: (): any => import('./change-pos-terminal.component').then(c => c.ChangePosTerminalComponent)
  },
  {
    path: ':posTerminalId/info',
    loadComponent: (): any => import('./change-pos-terminal-info/change-pos-terminal-info.component').then(c => c.ChangePosTerminalInfoComponent),
    canActivate: [NgxPermissionsGuard],
    data: {
      breadcrumb: 'Информация',
      permissions: {
        only: '',
        redirectTo: '/access-denied'
      }
    }
  },
  {
    path: ':posTerminalId/edit',
    loadComponent: (): any => import('./change-pos-terminal-edit/change-pos-terminal-edit.component').then(c => c.ChangePosTerminalEditComponent),
    canActivate: [NgxPermissionsGuard],
    data: {
      breadcrumb: 'Редактирование',
      permissions: {
        only: '',
        redirectTo: '/access-denied'
      }
    }
  }
];
