import {Routes} from '@angular/router';
import {ComponentGuard} from '@core/guards/component.guard';
import {AccountTypeComponent} from '@modules/directory/account-type/account-type.component';
import {
  AccountTypeDetailComponent
} from '@modules/directory/account-type/account-type-detail/account-type-detail.component';
import {
  AccountTypeEditComponent
} from '@modules/directory/account-type/account-type-detail/account-type-edit/account-type-edit.component';
import {NgxPermissionsGuard} from 'ngx-permissions';

export const ACCOUNT_TYPE_ROUTING: Routes = [
  {
    path: '',
    component: AccountTypeComponent,
    canActivate: [NgxPermissionsGuard],
    data: {
      breadcrumb: 'Тип счета',
      permissions: {
        only: 'AccountTypeList',
        redirectTo: '/access-denied'
      }
    }
  },
  {
    path: 'new',
    component: AccountTypeEditComponent,
    canDeactivate: [ComponentGuard],
    canActivate: [NgxPermissionsGuard],
    data: {
      breadcrumb: 'Добавление',
      permissions: {
        only: 'AccountTypeCreate',
        redirectTo: '/access-denied'
      }
    }
  },
  {
    path: ':acTypeId',
    component: AccountTypeDetailComponent,
    data: {breadcrumb: {skip: true}},
    children: [
      {
        path: 'edit',
        component: AccountTypeEditComponent,
        canDeactivate: [ComponentGuard],
        canActivate: [NgxPermissionsGuard],
        data: {
          breadcrumb: 'Редактирование',
          permissions: {
            only: 'AccountTypeUpdate',
            redirectTo: '/access-denied'
          }
        }
      }
    ]
  },

];
