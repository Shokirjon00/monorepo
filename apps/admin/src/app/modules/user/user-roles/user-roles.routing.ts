import {Routes} from '@angular/router';
import {ComponentGuard} from '@eskhata/util';
import {UserRolesComponent} from "@modules/user/user-roles/user-roles.component";
import {UserRolesInfoComponent} from "@modules/user/user-roles/user-detail/user-roles-info/user-roles-info.component";
import {UserRolesDetailComponent} from "@modules/user/user-roles/user-detail/user-roles-detail.component";
import {UserRolesEditComponent} from "@modules/user/user-roles/user-detail/user-roles-edit/user-roles-edit.component";

export const USER_LIST_ROUTING: Routes = [
  {
    path: '',
    component: UserRolesComponent,
  },
  {
    path: 'new',
    component: UserRolesEditComponent,
    data: {
      breadcrumb: 'Добавление '
    }
  },
  {
    path: 'detail/:userRolesId',
    component: UserRolesDetailComponent,
    data: {breadcrumb: {skip: true}},
    children: [
      {
        path: 'edit',
        component: UserRolesEditComponent,
        canDeactivate: [ComponentGuard],
        data: {
          breadcrumb: 'Редактирование '
        }
      },
      {
        path: 'info',
        component: UserRolesInfoComponent,
        data: {
          breadcrumb: 'Информация'
        }
      }
    ]
  }
];
