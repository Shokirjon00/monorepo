import {PaymentHistoryComponent} from "@modules/payment/payment-detail/payment-history/payment-history.component";
import {Routes} from "@angular/router";
import {PaymentDetailComponent} from "@modules/payment/payment-detail/payment-detail.component";
import {PaymentInfoComponent} from "@modules/payment/payment-detail/payment-info/payment-info.component";

export const PAYMENT_DETAIL_ROUTING: Routes = [
  {
    path: '',
    component: PaymentDetailComponent,
    data: {
      breadcrumb: 'Детальный просмотр'
    },
    children: [
      {
        path: '',
        redirectTo: 'payment-history',
        pathMatch: 'full'
      },
      {
        path: 'payment-history',
        component: PaymentHistoryComponent,
        data: {
          breadcrumb: {skip: true}
        }
      },
      {
        path: 'payment-info',
        component: PaymentInfoComponent,
        data: {
          breadcrumb: {skip: true}
        }
      }
    ]
  },
]
