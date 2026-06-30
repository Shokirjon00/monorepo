import { MerchantComponent } from '@modules/client/merchant/merchant.component';
import { Routes } from '@angular/router';

export const MERCHANT_ROUTES: Routes = [
  {
    path: '',
    component: MerchantComponent,
    data: {
      showBreadcrumbs: false,
      showFilters: true
    }
  },
  {
    path: 'new',
    loadComponent: (): any => import('./merchant-detail/merchant-edit/merchant-edit.component').then(c => c.MerchantEditComponent),
    data: {
      breadcrumb: 'Новая торговая точка'
    },
  },
  {
    path: ':merchantId',
    loadChildren: (): any => import('./merchant-detail/merchant-detail.routing').then(m => m.MERCHANT_DETAIL_ROUTES),
    data: {
      breadcrumb: {alias: 'merchantDetail'}
    },
  }
]
