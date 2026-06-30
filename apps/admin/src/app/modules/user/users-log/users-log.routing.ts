import {Routes} from '@angular/router';
import {UserAdminDetailComponent} from '@modules/user/user-admin/user-admin-detail/user-admin-detail.component';
import {NgxPermissionsGuard} from 'ngx-permissions';

export const USERS_LOG_ROUTING: Routes = [
  {
    path: '',
    loadComponent: (): any => import('./users-log.component').then(c => c.UsersLogComponent),
  },
  {
    path: 'detail/:adminUserId',
    component: UserAdminDetailComponent,
    data: {breadcrumb: {skip: true}},
    children: [
      {
        path: 'info',
        loadComponent: (): any => import('@modules/user/users-log/users-log-detail/users-log-info.component').then(c => c.UsersLogInfoComponent),
        canActivate: [NgxPermissionsGuard],
        data: {
          breadcrumb: 'Информация',
          permissions: {
            only: 'PosTerminalUserActivitiesDetail'
          }
        }
      }
    ]
  }
];
