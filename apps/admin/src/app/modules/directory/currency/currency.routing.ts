import {Routes} from "@angular/router";
import {CurrencyComponent} from "@modules/directory/currency/currency.component";
import {NgxPermissionsGuard} from "ngx-permissions";
import {ComponentGuard} from '@eskhata/util';
import {CurrencyEditComponent} from "@modules/directory/currency/currency-detail/currency-edit/currency-edit.component";

export const CURRENCY_ROUTING: Routes = [
  {
    path: '',
    component: CurrencyComponent,
    data: {breadcrumb: 'Валюта'}
  },
  {
    path: 'new',
    component: CurrencyEditComponent,
    canActivate: [NgxPermissionsGuard],
    data: {
      breadcrumb: 'Добавление',
      permissions: {
        only: 'CurrencyCreate',
        redirectTo: '/access-denied'
      }
    }
  },
  {
    path: 'edit/:id',
    component: CurrencyEditComponent,
    canDeactivate: [ComponentGuard],
    canActivate: [NgxPermissionsGuard],
    data: {
      breadcrumb: 'Редактирование',
      permissions: {
        only: 'CurrencyUpdate',
        redirectTo: '/access-denied'
      }
    }
  },
]
