import { Routes } from '@angular/router';
import { CompanyDetailComponent } from '@modules/client/company/company-detail/company-detail.component';
import { CompanyInfoComponent } from '@modules/client/company/company-detail/company-info/company-info.component';
import { ComponentGuard } from '@eskhata/util';
import { NgxPermissionsGuard } from 'ngx-permissions';

export const COMPANY_DETAIL_ROUTES: Routes = [
  {
    path: '',
    component: CompanyDetailComponent,
    data: {breadcrumb: {alias: 'companyDetail'}},
    children: [
      {
        path: '',
        redirectTo: 'merchant',
        pathMatch: 'full'
      },
      {
        path: 'merchant',
        loadChildren: (): any => import('../../merchant/merchant.routing').then(m => m.MERCHANT_ROUTES),
        data: {
          breadcrumb: 'Торговые точки',
          fromCompany: true
        }
      },
      {
        path: 'cashback',
        loadChildren: (): any => import('./cashback-company/cashback-company.routing').then(m => m.CASHBACK_COMPANY_ROUTING),
        canActivate: [NgxPermissionsGuard],
        data: {
          breadcrumb: 'Кэшбэк',
          permissions: {
            only: 'CashbackCompanyList',
            redirectTo: '/access-denied'
          }
        }
      },
      {
        path: 'commission',
        loadChildren: (): any => import('./commission-company/commission-company.routing').then(m => m.COMMISSION_COMPANY_ROUTING),
        canActivate: [NgxPermissionsGuard],
        data: {
          breadcrumb: 'Комиссия',
          permissions: {
            only: 'CommissionCompanyList',
            redirectTo: '/access-denied'
          }
        }
      },
      {
        path: 'accounts',
        loadChildren: (): any => import('./account/account.routing').then(m => m.ACCOUNT_ROUTES),
        canActivate: [NgxPermissionsGuard],
        data: {
          permissions: {
            only: 'AccountRequisites',
            redirectTo: '/access-denied'
          },
          breadcrumb: 'Счета'
        }
      },
      {
        path: 'system-accounts',
        loadChildren: (): any => import('./system-account/system-account.routing').then(m => m.SYSTEM_ACCOUNT_ROUTES),
        canActivate: [NgxPermissionsGuard],
        data: {
          permissions: {
            only: 'AccountSystemRequisites',
            redirectTo: '/access-denied'
          },
          breadcrumb: 'Системные счета'
        }
      },
      {
        path: 'info',
        component: CompanyInfoComponent,
        data: {
          permissions: {
            only: 'CompanyDetail',
            redirectTo: '/access-denied'
          },
          breadcrumb: 'Информация'
        }
      },
      {
        path: 'acquirer',
        loadComponent: (): any => import('./company-acquirer/company-acquirer.component').then(c => c.CompanyAcquirerComponent),
        canActivate: [NgxPermissionsGuard],
        data: {
          breadcrumb: 'Эквайер',
          permissions: {
            only: 'CompanyAcquirersDictionary',
            redirectTo: '/access-denied'
          }
        }
      },
      {
        path: 'integration-setting',
        loadComponent: (): any => import('./integration-setting/integration-setting.component').then(c => c.IntegrationSettingComponent),
        canActivate: [NgxPermissionsGuard],
        data: {
          breadcrumb: 'Настройки интеграции',
          permissions: {
            only: 'MerchantIntegrationConfigurationList',
            redirectTo: '/access-denied'
          }
        }
      }
    ],
  },
  {
    path: 'edit',
    loadComponent: (): any => import('./../company-edit/company-edit.component').then(c => c.CompanyEditComponent),
    canDeactivate: [ComponentGuard],
    data: {
      breadcrumb: 'Редактировать организацию',
    }
  },
]
