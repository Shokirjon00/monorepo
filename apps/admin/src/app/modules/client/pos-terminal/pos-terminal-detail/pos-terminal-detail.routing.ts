import { Routes } from "@angular/router";
import { PosTerminalDetailComponent } from "@modules/client/pos-terminal/pos-terminal-detail/pos-terminal-detail.components";
import { ComponentGuard } from '@eskhata/util';
import { NgxPermissionsGuard } from "ngx-permissions";

export const POS_TERMINAL_DETAIL_ROUTING: Routes = [
  {
    path: '',
    component: PosTerminalDetailComponent,
    children: [
      {
        path: 'edit',
        loadComponent:(): any => import('@modules/client/pos-terminal/pos-terminal-edit/pos-terminal-edit.component').then(c => c.PosTerminalEditComponent),
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
        loadComponent: (): any => import('@modules/client/pos-terminal/pos-terminal-detail/pos-terminal-info/pos-terminal-info.component').then(c => c.PosTerminalInfoComponent),
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
