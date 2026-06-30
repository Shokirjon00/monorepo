import {Routes} from '@angular/router';
import {ComponentGuard} from '@core/guards/component.guard';
import {AccountCategoryTypeComponent} from '@modules/directory/account-category-type/account-category-type.component';
import {
  AccountCategoryTypeDetailComponent
} from '@modules/directory/account-category-type/account-category-type-detail/account-category-type-detail.component';
import {
  AccountCategoryTypeEditComponent
} from '@modules/directory/account-category-type/account-category-type-detail/account-category-type-edit/account-category-type-edit.component';
import {
  AccountCategoryTypeInfoComponent
} from '@modules/directory/account-category-type/account-category-type-detail/account-category-type-info/account-category-type-info.component';
import {NgxPermissionsGuard} from 'ngx-permissions';

export const ACCOUNT_CATEGORY_TYPE_ROUTING: Routes = [
  {
    path: '',
    component: AccountCategoryTypeComponent,
    data: {
      breadcrumb: 'Категория типа счета',
    }
  },
  {
    path: 'new',
    component: AccountCategoryTypeEditComponent,
    canActivate: [NgxPermissionsGuard],
    data: {
      breadcrumb: 'Добавление',
      permissions: {
        only: 'AccountCategoryTypeCreate',
        redirectTo: '/access-denied'
      }
    }
  },
  {
    path: 'detail/:acTypeId',
    component: AccountCategoryTypeDetailComponent,
    data: {breadcrumb: {skip: true}},
    children: [
      {
        path: 'edit',
        component: AccountCategoryTypeEditComponent,
        canDeactivate: [ComponentGuard],
        canActivate: [NgxPermissionsGuard],
        data: {
          breadcrumb: 'Редактирование',
          permissions: {
            only: 'AccountCategoryTypeUpdate',
            redirectTo: '/access-denied'
          }
        }
      },
      {
        path: 'info',
        component: AccountCategoryTypeInfoComponent,
        canActivate: [NgxPermissionsGuard],
        data: {
          breadcrumb: 'Информация',
          permissions: {
            only: 'AccountCategoryTypeDetail',
            redirectTo: '/access-denied'
          }
        }
      },
    ]
  },
];
