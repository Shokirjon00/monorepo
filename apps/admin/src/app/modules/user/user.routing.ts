import {Routes} from '@angular/router';
import {UserComponent} from '@modules/user/user.component';
import {NgxPermissionsGuard} from 'ngx-permissions';

export const USER_ROUTING: Routes = [
  {
    path: '',
    component: UserComponent,
    data: {breadcrumb: {skip: true}},
    children: [
      {
        path: '',
        redirectTo: 'admin',
        pathMatch: 'full'
      },
      {
        path: 'admin',
        loadChildren: (): any => import('./user-admin/user-admin.routing').then(m => m.ADMIN_ROUTING),
        canActivate: [NgxPermissionsGuard],
        data: {
          breadcrumb: 'Администратор',
          permissions: {
            only: 'AdminUserList',
            redirectTo: 'user/admin-log'
          }
        }
      },
      {
        path: 'admin-log',
        loadComponent: (): any => import('./user-admin-log/user-admin-log.component').then(c => c.UserAdminLogComponent),
        canActivate: [NgxPermissionsGuard],
        data: {
          breadcrumb: 'Действие администраторов',
          permissions: {
            only: 'AdminUserActivitiesList',
            redirectTo: 'user/client'
          }
        }
      },
      {
        path: 'client',
        loadChildren: (): any => import('./user-client/user-client.routing').then(m => m.USER_LIST_ROUTING),
        canActivate: [NgxPermissionsGuard],
        data: {
          breadcrumb: 'Клиент',
          permissions: {
            only: 'ClientUserList',
            redirectTo: '/access-denied'
          }
        },
      },
      {
        path: 'client-log',
        loadComponent: (): any => import('./user-client-log/user-client-log.component').then(c => c.UserClientLogComponent),
        canActivate: [NgxPermissionsGuard],
        data: {
          breadcrumb: 'Действие клиентов',
          permissions: {
            only: 'UserActivitiesList',
            redirectTo: 'user/client'
          }
        }
      },
      {
        path: 'history-update',
        loadChildren: (): any => import('./client-history/client-history.routing').then(m => m.HISTORY_ROUTING),
        canActivate: [NgxPermissionsGuard],
        data: {
          breadcrumb: 'История изменений',
          permissions: {
            only: 'AdminUserAuditTablesList',
            redirectTo: 'user/history-update'
          }
        }
      },
      {
        path: 'client-roles',
        loadChildren: (): any => import('./user-roles/user-roles.routing').then(m => m.USER_LIST_ROUTING),
        canActivate: [NgxPermissionsGuard],
        data: {
          breadcrumb: 'Пользователи',
          permissions: {
            only: 'PosTerminalUserList',
            redirectTo: '/access-denied'
          }
        },
      },
      {
        path: 'users-log',
        loadChildren: (): any => import('./users-log/users-log.routing').then(m => m.USERS_LOG_ROUTING),
        canActivate: [NgxPermissionsGuard],
        data: {
          breadcrumb: 'Действия пользователей',
          permissions: {
            only: 'PosTerminalUserActivitiesList',
            redirectTo: '/access-denied'
          }
        },
      },
      {
        path: 'users-history-update',
        loadChildren: (): any => import('./users-history/users-history.routing').then(m => m.USERS_HISTORY_ROUTING),
        canActivate: [NgxPermissionsGuard],
        data: {
          breadcrumb: 'Журнал изменений',
          permissions: {
            only: 'PosTerminalUserAuditTablesList',
            redirectTo: '/access-denied'
          }
        }
      },
    ]
  }
];
