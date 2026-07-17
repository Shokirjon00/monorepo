import {Routes} from '@angular/router';
import {CityComponent} from '@modules/directory/city/city.component';
import {CityEditComponent} from '@modules/directory/city/city-detail/city-edit/city-edit.component';
import {CityInfoComponent} from '@modules/directory/city/city-detail/city-info/city-info.component';
import {ComponentGuard} from '@eskhata/util';
import {NgxPermissionsGuard} from 'ngx-permissions';

export const CITY_ROUTES: Routes = [
  {
    path: '',
    component: CityComponent,
    data: {breadcrumb: 'Город'}
  },
  {
    path: 'new',
    component: CityEditComponent,
    canActivate: [NgxPermissionsGuard],
    data: {
      breadcrumb: 'Добавление',
      permissions: {
        only: 'CityCreate',
        redirectTo: '/access-denied'
      }
    }
  },
  {
    path: 'edit/:id',
    component: CityEditComponent,
    canDeactivate: [ComponentGuard],
    canActivate: [NgxPermissionsGuard],
    data: {
      breadcrumb: 'Редактирование',
      permissions: {
        only: 'CityUpdate',
        redirectTo: '/access-denied'
      }
    }
  },
  {
    path: 'info/:id',
    component: CityInfoComponent,
    canActivate: [NgxPermissionsGuard],
    data: {
      breadcrumb: 'Информация',
      permissions: {
        only: 'CityDetail',
        redirectTo: '/access-denied'
      }
    }
  },
];
