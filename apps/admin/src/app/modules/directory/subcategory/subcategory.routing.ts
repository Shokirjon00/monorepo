import {Routes} from '@angular/router';
import {SubcategoryComponent} from './subcategory.component';
import {
  SubcategoryEditComponent
} from '@modules/directory/subcategory/subcategory-detail/subcategory-edit/subcategory-edit.component';
import {
  SubcategoryInfoComponent
} from '@modules/directory/subcategory/subcategory-detail/subcategory-info/subcategory-info.component';
import {ComponentGuard} from '@core/guards/component.guard';
import {NgxPermissionsGuard} from 'ngx-permissions';

export const SUBCATEGORY_ROUTING: Routes = [
  {
    path: '',
    component: SubcategoryComponent,
    data: {breadcrumb: 'Подкатегория'}
  },
  {
    path: 'new',
    component: SubcategoryEditComponent,
    canActivate: [NgxPermissionsGuard],
    data: {
      breadcrumb: 'Добавление',
      permissions: {
        only: 'SubCategoryCreate',
        redirectTo: '/access-denied'
      }
    }
  },
  {
    path: 'edit/:id',
    component: SubcategoryEditComponent,
    canDeactivate: [ComponentGuard],
    canActivate: [NgxPermissionsGuard],
    data: {
      breadcrumb: 'Редактирование',
      permissions: {
        only: 'SubCategoryUpdate',
        redirectTo: '/access-denied'
      }
    }
  },
  {
    path: 'info/:id',
    component: SubcategoryInfoComponent,
    canActivate: [NgxPermissionsGuard],
    data: {
      breadcrumb: 'Информация',
      permissions: {
        only: 'SubCategoryDetail',
        redirectTo: '/access-denied'
      }
    }
  },
];
