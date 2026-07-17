import {Routes} from '@angular/router';
import {AreaComponent} from '@modules/directory/area/area.component';
import {AreaEditComponent} from '@modules/directory/area/area-detail/area-edit/area-edit.component';
import {AreaInfoComponent} from '@modules/directory/area/area-detail/area-info/area-info.component';
import {ComponentGuard} from '@eskhata/util';
import {NgxPermissionsGuard} from 'ngx-permissions';

export const AREA_ROUTES: Routes = [
  {
    path: '',
    component: AreaComponent,
    data: {breadcrumb: 'Район'}
  },

  {
    path: 'new',
    component: AreaEditComponent,
    canActivate: [NgxPermissionsGuard],
    data: {
      breadcrumb: 'Добавление',
      permissions: {
        only: 'AreaCreate',
        redirectTo: '/access-denied'
      }
    }
  },
  {
    path: 'edit/:id',
    component: AreaEditComponent,
    canDeactivate: [ComponentGuard],
    canActivate: [NgxPermissionsGuard],
    data: {
      breadcrumb: 'Редактирование',
      permissions: {
        only: 'AreaUpdate',
        redirectTo: '/access-denied'
      }
    }
  },
  {
    path: 'info/:id',
    component: AreaInfoComponent,
    canActivate: [NgxPermissionsGuard],
    data: {
      breadcrumb: 'Информация',
      permissions: {
        only: 'AreaDetail',
        redirectTo: '/access-denied'
      }
    }
  },
];
