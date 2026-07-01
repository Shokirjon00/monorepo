import {Routes} from '@angular/router';
import {PaymentRefundReasonComponent} from './payment-refund-reason.component';
import {ComponentGuard} from '@eskhata/util';
import {NgxPermissionsGuard} from 'ngx-permissions';
import {
  PaymentRefundReasonEditComponent
} from '@modules/directory/payment-refund-reason/payment-refund-reason-edit/payment-refund-reason-edit.component';
import {
  PaymentRefundReasonInfoComponent
} from '@modules/directory/payment-refund-reason/payment-refund-reason-info/payment-refund-reason-info.component';

export const CATEGORY_ROUTING: Routes = [
  {
    path: '',
    component: PaymentRefundReasonComponent,
    data: {breadcrumb: 'Причина отказа'}
  },
  {
    path: 'new',
    component: PaymentRefundReasonEditComponent,
    canActivate: [NgxPermissionsGuard],
    data: {
      breadcrumb: 'Добавление причину отказа',
      permissions: {
        only: 'PaymentRefundReasonCreate',
        redirectTo: '/access-denied'
      }
    }
  },
  {
    path: 'edit/:id',
    component: PaymentRefundReasonEditComponent,
    canDeactivate: [ComponentGuard],
    canActivate: [NgxPermissionsGuard],
    data: {
      breadcrumb: 'Редактирование',
      permissions: {
        only: 'PaymentRefundReasonUpdate',
        redirectTo: '/access-denied'
      }
    }
  },
  {
    path: 'info/:id',
    component: PaymentRefundReasonInfoComponent,
    canActivate: [NgxPermissionsGuard],
    data: {
      breadcrumb: 'Информация ',
      permissions: {
        only: 'CategoryDetail',
        redirectTo: '/access-denied'
      }
    }
  },
];
