import {Routes} from '@angular/router';
import {AdminRoleComponent} from '@modules/directory/admin-role/admin-role.component';
import {
  AdminRoleEditComponent
} from '@modules/directory/admin-role/admin-role-detail/admin-role-edit/admin-role-edit.component';
import {
  AdminRoleInfoComponent
} from '@modules/directory/admin-role/admin-role-detail/admin-role-info/admin-role-info.component';
import {ComponentGuard} from '@eskhata/util';
import {AdminRoleDetailComponent} from '@modules/directory/admin-role/admin-role-detail/admin-role-detail.component';

export const ADMIN_ROLES_ROUTING: Routes = [
  {
    path: '',
    component: AdminRoleComponent,
    data: {
      breadcrumb: 'Роль администратора',
    }
  },
  {
    path: 'new',
    component: AdminRoleEditComponent,
    data: {breadcrumb: 'Добавление'}
  },
  {
    path: 'detail/:roleId',
    component:AdminRoleDetailComponent,
    data: {breadcrumb: {skip: true}},
    children: [
      {
        path: 'edit',
        component: AdminRoleEditComponent,
        canDeactivate: [ComponentGuard],
        data: {breadcrumb: 'Редактирование'}
      },
      {
        path: 'info',
        component: AdminRoleInfoComponent,
        data: {breadcrumb: 'Информация'}
      }
    ]
  },

];
