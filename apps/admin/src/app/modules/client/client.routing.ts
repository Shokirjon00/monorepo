import {Routes} from '@angular/router';
import {ClientComponent} from './client.component';
import {NgxPermissionsGuard} from 'ngx-permissions';

export const CLIENT_ROUTES: Routes = [
  {
    path: '',
    component: ClientComponent,
    data: {breadcrumb: 'Клиенты'},
    children: [
      {
        path: '',
        redirectTo: 'company',
        pathMatch: 'full',
      },
      {
        path: 'company',
        loadChildren: (): any => import('./company/company.routing').then(m => m.COMPANY_ROUTES),
        canActivate: [NgxPermissionsGuard],
        data: {
          breadcrumb: 'Организации',
          permissions: {
            only: 'CompanyList',
            redirectTo: '/access-denied'
          }
        },
      },
      {
        path: 'merchant',
        loadChildren: (): any => import('./merchant/merchant.routing').then(m => m.MERCHANT_ROUTES),
        canActivate: [NgxPermissionsGuard],
        data: {
          breadcrumb: 'Торговые точки',
          permissions: {
            only: 'MerchantList',
            redirectTo: '/access-denied'
          }
        }
      },
      {
        path: 'poses',
        loadChildren: (): any => import('./pos/pos.routing').then(m => m.POS_ROUTES),
        canActivate: [NgxPermissionsGuard],
        data: {
          breadcrumb: 'Кассы',
          permissions: {
            only: 'PosList',
            redirectTo: '/access-denied'
          }
        }
      },
      {
        path: 'service',
        loadChildren: (): any => import('./merchant-service/merchant-service.routing').then(m => m.MERCHANT_SERVICE_ROUTE),
        canActivate: [NgxPermissionsGuard],
        data: {
          breadcrumb: 'Доп.параметры',
          permissions: {
            only: 'MerchantServiceList',
            redirectTo: '/access-denied'
          }
        }
      },
      {
        path: 'pos-terminal',
        loadChildren: (): any => import('./pos-terminal/pos-terminal.routing').then(m => m.POS_TERMINAL_ROUTES),
        canActivate: [NgxPermissionsGuard],
        data: {
          breadcrumb: 'Pos-terminal',
          permissions: {
            only: 'PosTerminalList',
            redirectTo: '/access-denied'
          }
        }
      },
      {
        path: 'pos-terminal-setting',
        loadChildren: (): any => import('./pos-terminal-setting/pos-terminal-setting.routing').then(m => m.POS_TERMINAL_SETTING_ROUTES),
        canActivate: [NgxPermissionsGuard],
        data: {
          breadcrumb: 'Pos-terminal-setting',
          permissions: {}
        }
      }
    ]
  }
];
