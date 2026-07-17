import { Routes } from '@angular/router';
import { ngxPermissionsGuard } from "ngx-permissions";
import {CHANGE_TERMINAL_POS_ROUTING} from "@modules/main-terminal/change-terminal-pos/change-pos-terminal.routing";

export const MAIN_TERMINAL_ROUTING: Routes = [
  {
    path: '',
    loadComponent: (): any => import('./main-terminal').then(c => c.MainTerminal),
    children: [
      {
        path: '',
        redirectTo: 'pos-terminal',
        pathMatch: 'full'
      },
      {
        path: 'pos-terminal',
        loadChildren: (): any => import('./pos-terminal/pos-terminal.routing').then(m => m.POS_TERMINAL_ROUTING),
        canActivate: [ngxPermissionsGuard],
        data: {
          breadcrumb: 'Pos-терминал',
          permissions: {
            only: 'PosTerminalList',
            redirectTo: '/access-denied'
          }
        },
      },
      {
        path: 'pos-list',
        loadChildren: (): any => import('./change-terminal-pos/change-pos-terminal.routing').then(m => m.CHANGE_TERMINAL_POS_ROUTING),
        canActivate: [ngxPermissionsGuard],
        data: {
          breadcrumb: 'Список POS',
          permissions: {
            only: '',
            redirectTo: '/access-denied'
          }
        },
      },
      {
        path: 'mobile-app',
        loadChildren: (): any => import('./mobile-app/mobile-app.routing').then(m => m.MOBILE_APP_ROUTING),
        canActivate: [ngxPermissionsGuard],
        data: {
          breadcrumb: 'Мобильная приложения',
          permissions: {
            only: 'PosTerminalMobileList',
            redirectTo: '/access-denied'
          }
        },
      },
      {
        path: 'shifts',
        loadChildren: (): any => import('./shifts/shifts.routing').then(m => m.SHIFTS_ROUTING),
        canActivate: [ngxPermissionsGuard],
        data: {
          breadcrumb: 'Смена Pos-терминалов',
          permissions: {
            only: 'ShiftList',
            redirectTo: '/access-denied'
          }
        },
      },
    ]
  },
];

