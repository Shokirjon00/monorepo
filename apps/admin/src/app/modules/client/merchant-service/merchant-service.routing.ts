import {Routes} from '@angular/router';
import {MerchantServiceComponent} from "@modules/client/merchant-service/merchant-service.component";

export const MERCHANT_SERVICE_ROUTE: Routes = [
  {
    path: '',
    component: MerchantServiceComponent,
  },
  {
    path: 'new',
    loadComponent: (): any => import('@modules/client/merchant-service/merchant-service-detail/merchant-service-edit/merchant-service-edit.component').then(c => c.MerchantServiceEditComponent),
    data: {
      breadcrumb: 'Добавление',
      permissions: {
        only: 'MerchantServiceUpdate',
        redirectTo: '/access-denied'
      }
    }
  },
  {
    path: ':serviceId',
    loadChildren: (): any => import('./merchant-service-detail/merchant-service-detail.routing').then(m => m.MERCHANT_SERVICE_DETAIL_ROUTE),
    data: {breadcrumb: {skip: true}},
  }
];
