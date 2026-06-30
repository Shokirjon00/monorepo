import {Routes} from '@angular/router';
import {UserAdminComponent} from '@modules/user/user-admin/user-admin.component';
import {UserAdminEditComponent} from '@modules/user/user-admin/user-admin-detail/user-admin-edit/user-admin-edit.component';
import {UserAdminDetailComponent} from '@modules/user/user-admin/user-admin-detail/user-admin-detail.component';
import {UserAdminInfoComponent} from '@modules/user/user-admin/user-admin-detail/user-admin-info/user-admin-info.component';
import {ComponentGuard} from '@core/guards/component.guard';
import {NgxPermissionsGuard} from 'ngx-permissions';

export const ADMIN_ROUTING: Routes = [
  {
    path: '',
    component: UserAdminComponent,
  },
  {
    path: 'new',
    component: UserAdminEditComponent,
    data: {
      breadcrumb: 'Добавление '
    }
  },
  {
    path: 'detail/:adminUserId',
    component: UserAdminDetailComponent,
    data: {breadcrumb: {skip: true}},
    children: [
      {
        path: 'edit',
        component: UserAdminEditComponent,
        canDeactivate: [ComponentGuard],
        data: {
          breadcrumb: 'Редактирование '
        }
      },
      {
        path: 'info',
        component: UserAdminInfoComponent,
        canActivate: [NgxPermissionsGuard],
        data: {
          breadcrumb: 'Информация',
          permissions: {
            only: 'AdminUserDetail',
            redirectTo: '/access-denied'
          }
        }
      }
    ]
  }
];
