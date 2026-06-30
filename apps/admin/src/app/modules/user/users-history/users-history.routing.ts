import {Routes} from '@angular/router';
import {UserAdminDetailComponent} from '@modules/user/user-admin/user-admin-detail/user-admin-detail.component';
import {NgxPermissionsGuard} from 'ngx-permissions';

export const USERS_HISTORY_ROUTING: Routes = [
  {
    path: '',
    loadComponent: (): any => import('./users-history.component').then(c => c.UsersHistoryComponent),
  },
  {
    path: 'detail/:adminUserId',
    component: UserAdminDetailComponent,
    data: {breadcrumb: {skip: true}},
    children: [
      {
        path: 'info',
        loadComponent: (): any => import('@modules/user/users-history/users-history-detail/users-history-info.component').then(c => c.UsersHistoryInfoComponent),
        canActivate: [NgxPermissionsGuard],
        data: {
          breadcrumb: 'Информация',
          permissions: {
            only: 'AdminUserAuditTablesDetail'
          }
        }
      }
    ]
  }
];
