import { Routes } from '@angular/router';
import { PaymentContinueFormComponent } from './payment-detail/payment-continue-form/payment-continue-form.component';

export const PAYMENTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: (): any => import('./payments.component').then(m => m.PaymentsComponent),
    data: {
      breadcrumb: {skip: true}
    },
  },
  {
    path: ':id',
    loadChildren: (): any => import('./payment-detail/payment-detail.routing').then(m => m.PAYMENT_DETAIL_ROUTING),
    data: {
      breadcrumb: 'Просмотр'
    }
  },
  {
    path: ':id/edit',
    loadComponent: (): Promise<typeof PaymentContinueFormComponent> => import('./payment-detail/payment-continue-form/payment-continue-form.component')
      .then(m => m.PaymentContinueFormComponent),
    data: {
      breadcrumb: 'Редактирование платежа'
    }
  },
]
