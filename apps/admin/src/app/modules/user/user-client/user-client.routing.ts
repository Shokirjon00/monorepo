import {Routes} from '@angular/router';
import {UserClientComponent} from '@modules/user/user-client/user-client.component';
import {UserDetailComponent} from '@modules/user/user-client/user-detail/user-detail.component';
import {UserEditComponent} from '@modules/user/user-client/user-detail/user-edit/user-edit.component';
import {UserInfoComponent} from '@modules/user/user-client/user-detail/user-info/user-info.component';
import {ComponentGuard} from '@eskhata/util';

export const USER_LIST_ROUTING: Routes = [
  {
    path: '',
    component: UserClientComponent,
  },
  {
    path: 'new',
    component: UserEditComponent,
    data: {
      breadcrumb: 'Добавление '
    }
  },
  {
    path: 'detail/:clientUserId',
    component: UserDetailComponent,
    data: {breadcrumb: {skip: true}},
    children: [
      {
        path: 'edit',
        component: UserEditComponent,
        canDeactivate: [ComponentGuard],
        data: {
          breadcrumb: 'Редактирование '
        }
      },
      {
        path: 'info',
        component: UserInfoComponent,
        data: {
          breadcrumb: 'Информация'
        }
      }
    ]
  }
];
