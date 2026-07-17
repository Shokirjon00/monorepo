import { Routes } from "@angular/router";
import { UserContainerComponent } from "@modules/user-container/user-container.component";
import { NgxPermissionsGuard } from "ngx-permissions";

export const USER_CONTAINER_ROUTING: Routes = [
  {
    path: '',
    component: UserContainerComponent,
    data: {breadcrumb: "Личный кабинет"},
    children: [
      {
        path: '',
        redirectTo: 'user',
        pathMatch: 'full'
      },
      {
        path: 'user',
        loadChildren:() :any => import('./user/user.routing').then(m=> m.USER),
        canActivate: [NgxPermissionsGuard],
        data: {
          breadcrumb: {skip: true},
          permissions: {
            only: 'UserList',
            redirectTo: '/access-denied'
          }
        }
      },
      {
        path: 'pos-terminal',
        loadChildren:() :any => import('./pos-terminal/pos-terminal.routing').then(m => m.POS_TERMINAL_ROUTES),
        canActivate: [NgxPermissionsGuard],
        data: {
          permissions: {
            only: 'PosTerminalUserList',
            redirectTo: '/access-denied'
          }
        }
      }
    ]
  }
]
