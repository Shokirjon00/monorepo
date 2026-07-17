import { Routes } from '@angular/router';
import { UserComponent } from './user.component';
import { NgxPermissionsGuard } from "ngx-permissions";
import { UserEditComponent } from "@modules/user-container/user/user-detail/user-edit/user-edit.component";
import { UserDetailComponent } from "@modules/user-container/user/user-detail/user-detail.component";
import { UserInfoComponent } from "@modules/user-container/user/user-detail/user-info/user-info.component";

export const USER: Routes = [
  {
    path: '',
    component: UserComponent,
  },
  {
    path: 'new',
    component: UserEditComponent,
    canActivate: [NgxPermissionsGuard],
    data: {
      breadcrumb: 'Добавление',
      permissions: {
        only: 'UserCreate',
        redirectTo: '/access-denied'
      }
    }
  },
  {
    path: 'detail/:userId',
    component: UserDetailComponent,
    data: {breadcrumb: {skip: true}},
    children: [
      {
        path: 'edit',
        component: UserEditComponent,
        canActivate: [NgxPermissionsGuard],
        data: {
          breadcrumb: 'Редактирование',
          permissions: {
            only: 'UserUpdate',
            redirectTo: '/access-denied'
          }
        }
      },
      {
        path: 'info',
        component: UserInfoComponent,
        canActivate: [NgxPermissionsGuard],
        data: {
          breadcrumb: 'Информация',
          permissions: {
            only: 'UserDetail',
            redirectTo: '/access-denied'
          }
        }
      }
    ]
  }
]
