import { Routes } from '@angular/router';
import { BrandComponent } from './brand.component';
import { BrandEditComponent } from './brand-detail/brand-edit/brand-edit.component';
import { BrandInfoComponent } from '@modules/directory/terminal-models/brand-detail/brand-info/brand-info.component';
import { NgxPermissionsGuard } from 'ngx-permissions';
import {ComponentGuard} from "@core/guards/component.guard";

export const TERMINAL_MODELS_ROUTING: Routes = [
  {
    path: '',
    component: BrandComponent,
    data: {breadcrumb: 'Модели терминалов'}
  },
  {
    path: 'new',
    component: BrandEditComponent,
    canActivate: [NgxPermissionsGuard],
    data: {
      breadcrumb: 'Добавление',
      permissions: {
        only: '',
        redirectTo: '/access-denied'
      }
    }
  },
  {
    path: 'edit/:id',
    component: BrandEditComponent,
    canDeactivate: [ComponentGuard],
    canActivate: [NgxPermissionsGuard],
    data: {
      breadcrumb: 'Редактирование',
      permissions: {
        only: '',
        redirectTo: '/access-denied'
      }
    }
  },
  {
    path: 'info/:id',
    component: BrandInfoComponent,
    canActivate: [NgxPermissionsGuard],
    data: {
      breadcrumb: 'Информация',
      permissions: {
        only: '',
        redirectTo: '/access-denied'
      }
    }
  },
];

