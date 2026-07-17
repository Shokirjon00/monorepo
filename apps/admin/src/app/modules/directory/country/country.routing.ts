import {Routes} from '@angular/router';
import {CountryComponent} from '@modules/directory/country/country.component';
import {CountryInfoComponent} from '@modules/directory/country/country-detail/country-info/country-info.component';
import {CountryEditComponent} from '@modules/directory/country/country-detail/country-edit/country-edit.component';
import {ComponentGuard} from '@eskhata/util';
import {NgxPermissionsGuard} from 'ngx-permissions';

export const COUNTRY_ROUTING: Routes = [
  {
    path: '',
    component: CountryComponent,
    data: {breadcrumb: 'Страна'}
  },
  {
    path: 'new',
    component: CountryEditComponent,
    canActivate: [NgxPermissionsGuard],
    data: {
      breadcrumb: 'Добавление',
      permissions: {
        only: 'CountryCreate',
        redirectTo: '/access-denied'
      }
    }
  },
  {
    path: 'edit/:id',
    component: CountryEditComponent,
    canDeactivate: [ComponentGuard],
    canActivate: [NgxPermissionsGuard],
    data: {
      breadcrumb: 'Редактирование',
      permissions: {
        only: 'CountryUpdate',
        redirectTo: '/access-denied'
      }
    }
  },
  {
    path: 'info/:id',
    component: CountryInfoComponent,
    canActivate: [NgxPermissionsGuard],
    data: {
      breadcrumb: 'Информация',
      permissions: {
        only: 'CountryDetail',
        redirectTo: '/access-denied'
      }
    }
  },
];
