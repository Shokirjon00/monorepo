import { Routes } from '@angular/router';
import { MerchantDetailComponent } from '@modules/client/merchant/merchant-detail/merchant-detail.component';
import { ComponentGuard } from '@eskhata/util';

export const MERCHANT_DETAIL_ROUTES: Routes = [
  {
    path: '',
    component: MerchantDetailComponent,
    data: {breadcrumb: {alias: 'merchantDetail'}},
    children: [
      {
        path: '',
        redirectTo: 'poses',
        pathMatch: 'full'
      },
      {
        path: 'poses',
        loadChildren: (): any => import('../../pos/pos.routing').then(m => m.POS_ROUTES),
        data: {
          breadcrumb: {skip: true},
          fromMerchant: true
        }
      },
      {
        path: 'service',
        loadChildren: (): any => import('./../../merchant-service/merchant-service.routing').then(m => m.MERCHANT_SERVICE_ROUTE),
        data: {breadcrumb: {skip: true}}
      },
      {
        path: 'pos-terminal',
        loadChildren: (): any => import('../../pos-terminal/pos-terminal.routing').then(m => m.POS_TERMINAL_ROUTES),
        data: {breadcrumb: {skip: true}}
      },
      {
        path: 'pos-terminal-setting',
        loadChildren: (): any => import('../../pos-terminal-setting/pos-terminal-setting.routing').then(m => m.POS_TERMINAL_SETTING_ROUTES),
        data: {breadcrumb: {skip: true}}
      },
      {
        path: 'info',
        loadComponent:():any => import('./merchant-info/merchant-info.component').then(c => c.MerchantInfoComponent),
        data: {breadcrumb: {skip: true}}
      },
    ]
  },
  {
    path: 'edit',
    loadComponent:():any => import('./merchant-edit/merchant-edit.component').then(c => c.MerchantEditComponent),
    canDeactivate: [ComponentGuard],
    data: {
      breadcrumb: 'Редактирование'
    }
  },
]
