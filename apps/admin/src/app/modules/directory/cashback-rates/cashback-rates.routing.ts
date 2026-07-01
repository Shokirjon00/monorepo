import {Routes} from '@angular/router';
import {CashbackRatesComponent} from '@modules/directory/cashback-rates/cashback-rates.component';
import {
  CashbackRatesEditComponent
} from '@modules/directory/cashback-rates/casback-rates-detail/casback-rates-edit/cashback-rates-edit.component';
import {
  CashbackRatesInfoComponent
} from '@modules/directory/cashback-rates/casback-rates-detail/cashback-rates-info/cashback-rates-info.component';
import {ComponentGuard} from '@eskhata/util';
import {NgxPermissionsGuard} from 'ngx-permissions';

export const CASHBACK_ROUTING: Routes = [
  {
    path: '',
    component: CashbackRatesComponent,
    data: {
      animation: true,
      breadcrumb: 'Ставки кэшбэков'
    }
  },
  {
    path: 'new',
    component: CashbackRatesEditComponent,
    canActivate: [NgxPermissionsGuard],
    data: {
      breadcrumb: 'Добавление',
      permissions: {
        only: 'CashbackCreate',
        redirectTo: '/access-denied'
      }
    }
  },
  {
    path: 'edit/:id',
    component: CashbackRatesEditComponent,
    canDeactivate: [ComponentGuard],
    canActivate: [NgxPermissionsGuard],
    data: {
      breadcrumb: 'Редактирование',
      permissions: {
        only: 'CashbackUpdate',
        redirectTo: '/access-denied'
      }
    }
  },
  {
    path: 'info/:id',
    component: CashbackRatesInfoComponent,
    canActivate: [NgxPermissionsGuard],
    data: {
      breadcrumb: 'Информация',
      permissions: {
        only: 'CashbackDetail',
        redirectTo: '/access-denied'
      }
    }
  },
];
