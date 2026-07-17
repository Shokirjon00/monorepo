import { PosTerminalComponent } from "@modules/user-container/pos-terminal/pos-terminal.component";
import { NgxPermissionsGuard } from "ngx-permissions";
import { ComponentGuard } from '@eskhata/util';

export const POS_TERMINAL_ROUTES = [
  {
    path: '',
    component: PosTerminalComponent,
  },
  {
    path: 'new',
    loadComponent: (): any =>import('./pos-terminal-edit/pos-terminal-edit.component').then(c => c.PosTerminalEditComponent),
    canActivate: [NgxPermissionsGuard],
    data: {
      breadcrumb: 'Добавление',
      permissions: {
        only: 'PosTerminalUserCreate',
        redirectTo: '/access-denied'
      }
    }
  },
  {
    path: 'edit/:id',
    loadComponent: (): any =>import('./pos-terminal-edit/pos-terminal-edit.component').then(c => c.PosTerminalEditComponent),
    canDeactivate: [ComponentGuard],
    canActivate: [NgxPermissionsGuard],
    data: {
      breadcrumb: 'Редактирование',
      permissions: {
        only: 'PosTerminalUserUpdate',
        redirectTo: '/access-denied'
      }
    }
  },
  {
    path: 'info/:id',
    loadComponent: (): any =>import('./pos-terminal-info/pos-terminal-info.component').then(c => c.PosTerminalInfoComponent),
    canActivate: [NgxPermissionsGuard],
    data: {
      breadcrumb: 'Информация',
      permissions: {
        only: 'PosTerminalUserDetail',
        redirectTo: '/access-denied'
      }
    }
  }
]
