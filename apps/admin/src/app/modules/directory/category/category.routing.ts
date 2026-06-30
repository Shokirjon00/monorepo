import {Routes} from '@angular/router';
import {CategoryComponent} from './category.component';
import {CategoryEditComponent} from '@modules/directory/category/category-detail/category-edit/category-edit.component';
import {CategoryInfoComponent} from '@modules/directory/category/category-detail/category-info/category-info.component';
import {ComponentGuard} from '@core/guards/component.guard';
import {NgxPermissionsGuard} from 'ngx-permissions';

export const CATEGORY_ROUTING: Routes = [
  {
    path: '',
    component: CategoryComponent,
    data: {breadcrumb: 'Категория'}
  },
  {
    path: 'new',
    component: CategoryEditComponent,
    canActivate: [NgxPermissionsGuard],
    data: {
      breadcrumb: 'Добавление',
      permissions: {
        only: 'CategoryCreate',
        redirectTo: '/access-denied'
      }
    }
  },
  {
    path: 'edit/:id',
    component: CategoryEditComponent,
    canDeactivate: [ComponentGuard],
    canActivate: [NgxPermissionsGuard],
    data: {
      breadcrumb: 'Редактирование',
      permissions: {
        only: 'CategoryUpdate',
        redirectTo: '/access-denied'
      }
    }
  },
  {
    path: 'info/:id',
    component: CategoryInfoComponent,
    canActivate: [NgxPermissionsGuard],
    data: {
      breadcrumb: 'Информация',
      permissions: {
        only: 'CategoryDetail',
        redirectTo: '/access-denied'
      }
    }
  },
];
