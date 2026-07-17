import { Routes } from '@angular/router';
import { MerchantContainerComponent } from '@modules/merchant-container/merchant-container.component';
import { AccountComponent } from '@modules/merchant-container/account/account.component';
import { NgxPermissionsGuard } from 'ngx-permissions';
import { MerchantHistoryHistoriesComponent } from '@modules/merchant-container/merchant-histories/merchant-history-histories.component';

export const MERCHANT_CONTAINER: Routes = [
  {
    path: '',
    component: MerchantContainerComponent,
    data: { breadcrumb: 'Торговые точки' },
    children: [
      {
        path: '',
        redirectTo: 'merchant',
        pathMatch: 'full',
      },
      {
        path: 'merchant',
        loadChildren: (): any => import('./merchant/merchant.routing').then(m => m.MERCHANT),
        canActivate: [NgxPermissionsGuard],
        data: {
          breadcrumb: { skip: true },
          permissions: {
            only: 'MerchantList',
            redirectTo: '/access-denied',
          },
        },
      },
      {
        path: 'applications',
        loadComponent: (): any =>
          import('./merchant-histories/merchant-history-histories.component').then(
            c => c.MerchantHistoryHistoriesComponent
          ),
        canActivate: [NgxPermissionsGuard],
        data: {
          breadcrumb: 'Заявки',
          permissions: {
            only: 'MerchantApplicationList',
            redirectTo: '/access-denied',
          },
        },
      },
      {
        path: 'cashback',
        loadChildren: (): any => import('./cashback/cashback.routing').then(m => m.CASHBACK_ROUTING),
      },
      {
        path: 'account',
        component: AccountComponent,
        canActivate: [NgxPermissionsGuard],
        data: {
          permissions: {
            only: 'AccountList',
            redirectTo: '/access-denied',
          },
        },
      },
      {
        path: 'company-info',
        loadChildren: (): any => import('./company-info/company-info.routing').then(m => m.COMPANY_INFO_ROUTES),
        canActivate: [NgxPermissionsGuard],
        data: {
          breadcrumb: 'Об организации',
          permissions: {
            only: 'CompanyDetail',
            redirectTo: '/access-denied',
          },
        },
      },
    ],
  },
];
