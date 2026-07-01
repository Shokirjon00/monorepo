import { Routes } from "@angular/router";
import { ComponentGuard } from '@eskhata/util';
import { NgxPermissionsGuard } from "ngx-permissions";

export const POS_TERMINAL_DETAIL_ROUTING: Routes = [
  {
    path: '',
    loadComponent: (): any => import('./../pos-terminal-detail/pos-terminal-detail.component').then(c => c.PosTerminalDetailComponent),
    children: [
      {
        path: 'edit',
        loadComponent: (): any => import('./../pos-terminal-edit/pos-terminal-edit.component').then(c => c.PosTerminalEditComponent),
        canDeactivate: [ComponentGuard],
        canActivate: [NgxPermissionsGuard],
        data: {
          breadcrumb: 'Редактирование',
          permissions: {
            only: 'PosTerminalUpdate',
            redirectTo: '/access-denied'
          }
        }
      },
      {
        path: 'info',
        loadComponent: (): any => import('./pos-terminal-info/pos-terminal-info.component').then(c => c.PosTerminalInfoComponent),
        canActivate: [NgxPermissionsGuard],
        data: {
          breadcrumb: 'Информация',
          permissions: {
            only: 'PosTerminalDetail',
            redirectTo: '/access-denied'
          }
        }
      },
    ]
  }
]
