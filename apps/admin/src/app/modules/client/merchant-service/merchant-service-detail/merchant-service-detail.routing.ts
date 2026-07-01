import {Routes} from '@angular/router';
import {ComponentGuard} from '@eskhata/util';
import { ngxPermissionsGuard } from 'ngx-permissions';

export const MERCHANT_SERVICE_DETAIL_ROUTE: Routes = [
  {
    path: '',
    loadComponent: (): any => import('./merchant-service-detail.component').then(c => c.MerchantServiceDetailComponent),
    children: [
      {
        path: 'edit',
        loadComponent: (): any => import('./merchant-service-edit/merchant-service-edit.component').then(c => c.MerchantServiceEditComponent),
        canDeactivate: [ComponentGuard],
        canActivate: [ngxPermissionsGuard],
        data: {
          breadcrumb: 'Редактирование',
          permissions: {
            only: 'MerchantServiceUpdate',
            redirectTo: '/access-denied'
          }
        }
      },
      {
        path: 'info',
        loadComponent: (): any => import('./merchant-service-info/merchant-service-info.component').then(c => c.MerchantServiceInfoComponent),
        canActivate: [ngxPermissionsGuard],
        data: {
          breadcrumb: 'Информация',
          permissions: {
            only: 'MerchantServiceDetail',
            redirectTo: '/access-denied'
          }
        }
      },
    ]
  }
]
