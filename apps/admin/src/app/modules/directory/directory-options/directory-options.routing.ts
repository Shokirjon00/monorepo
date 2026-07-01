import {Routes} from "@angular/router";
import {DirectoryOptionsComponent} from "@modules/directory/directory-options/directory-options.component";
import {NgxPermissionsGuard} from "ngx-permissions";
import {DirectoryOptionsInfoComponent} from "@modules/directory/directory-options/directory-options-detail/directory-options-info/directory-options-info.component";
import {ComponentGuard} from '@eskhata/util';
import {DirectoryOptionsEditComponent} from "@modules/directory/directory-options/directory-options-detail/directory-options-edit/directory-options-edit.component";

export const DIRECTORY_OPTIONS_ROUTING: Routes = [
  {
    path: '',
    component: DirectoryOptionsComponent,
    data: {
      breadcrumb: 'Доп.параметры'
    }
  },
  {
    path: 'new',
    component: DirectoryOptionsEditComponent,
    canActivate: [NgxPermissionsGuard],
    data: {
      breadcrumb: 'Добавление',
      permissions: {
        only: 'ServiceParamCreate',
        redirectTo: '/access-denied'
      }
    }
  },
  {
    path: 'edit/:id',
    component: DirectoryOptionsEditComponent,
    canDeactivate: [ComponentGuard],
    canActivate: [NgxPermissionsGuard],
    data: {
      breadcrumb: 'Редактирование',
      permissions: {
        only: 'ServiceParamUpdate',
        redirectTo: '/access-denied'
      }
    }
  },
  {
    path: 'info/:id',
    component: DirectoryOptionsInfoComponent,
    canActivate: [NgxPermissionsGuard],
    data: {
      breadcrumb: 'Информация',
      permissions: {
        only: 'ServiceParamDetail',
        redirectTo: '/access-denied'
      }
    }
  },
]
