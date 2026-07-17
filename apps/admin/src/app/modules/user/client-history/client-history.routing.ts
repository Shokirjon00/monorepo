import {Routes} from '@angular/router';
import {UserAdminDetailComponent} from '@modules/user/user-admin/user-admin-detail/user-admin-detail.component';
import {NgxPermissionsGuard} from 'ngx-permissions';

export const HISTORY_ROUTING: Routes = [
  {
    path: '',
    loadComponent: (): any => import('./client-history.component').then(c => c.ClientHistoryComponent),
  },
  {
    path: 'detail/:adminUserId',
    component: UserAdminDetailComponent,
    data: {breadcrumb: {skip: true}},
    children: [
      {
        path: 'info',
        loadComponent: (): any => import('@modules/user/client-history/client-history-detail/client-history-info.component').then(c => c.ClientHistoryInfoComponent),
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
