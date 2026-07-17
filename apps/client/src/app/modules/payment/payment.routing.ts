import {Routes} from '@angular/router';
import {PaymentComponent} from './payment.component';
import {NgxPermissionsGuard} from "ngx-permissions";


export const PAYMENTS: Routes = [
  {
    path: '',
    component: PaymentComponent
  },
  {
    path: ':id',
    loadChildren: (): any => import('./payment-detail/payment-detail.routing').then(m => m.PAYMENT_DETAIL_ROUTING),
    canActivate: [NgxPermissionsGuard],
    data: {
      breadcrumb: 'Информация',
      permissions: {
        only: 'PaymentDetail',
        redirectTo: '/access-denied'
      }
    }
  }
]
