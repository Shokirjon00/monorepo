import { Routes } from '@angular/router';
import { MainComponent } from './main.component';
import { AccessDeniedComponent } from '@modules/status-pages/access-denied/access-denied.component';
import { ngxPermissionsGuard, NgxPermissionsGuard } from 'ngx-permissions';

export const MAIN_ROUTES: Routes = [
  {
    path: '',
    component: MainComponent,
    children: [
      {
        path: '',
        redirectTo: 'analytics',
        pathMatch: 'full',
      },
      {
        path: 'analytics',
        loadChildren: (): any => import('./../analytics/analytics.routing').then(m => m.ANALYTICS_ROUTES),
        canActivate: [NgxPermissionsGuard],
        data: {
          breadcrumb: 'Аналитика',
          permissions: {
            only: 'Analytic',
            redirectTo: 'payments',
            pathMatch: 'full',
          },
        },
      },
      {
        path: 'payments',
        loadChildren: (): any => import('./../payment/payment.routing').then(m => m.PAYMENTS),
        canActivate: [NgxPermissionsGuard],
        data: {
          breadcrumb: 'Платежи',
          permissions: {
            only: 'PaymentList',
            redirectTo: 'food',
          },
        },
      },
      {
        path: 'food',
        loadChildren: (): any => import('./../food/food.routing').then(m => m.FOOD),
        canActivate: [NgxPermissionsGuard],
        data: {
          breadcrumb: 'Еда',
          permissions: {
            only: [
              'FoodVendorOrderList',
              'FoodVendorMenuList',
              'FoodVendorDeliveryTypeList',
              'FoodVendorStatisticsList',
              'FoodVendorStatisticsRevenue',
              'FoodVendorStatisticsClientAnalytics',
            ],
            redirectTo: 'advance-payments',
          },
        },
      },
      {
        path: 'advance-payments',
        loadChildren: (): any => import('./../advance-payments/advance-payments.routing').then(m => m.ADVANCE_PAYMENTS),
        canActivate: [NgxPermissionsGuard],
        data: {
          breadcrumb: 'Авансовые выплаты',
          permissions: {
            only: 'PaymentList',
            redirectTo: 'shift-history',
          },
        },
      },
      {
        path: 'shift-history',
        loadChildren: (): any => import('./../shift-history/shift-history.routing').then(m => m.SHIFT_HISTORY_ROUTING),
        canActivate: [NgxPermissionsGuard],
        data: {
          breadcrumb: 'История смены',
          permissions: {
            only: '',
            redirectTo: 'order',
          },
        },
      },
      {
        path: 'order',
        loadChildren: (): any => import('./../order/order.routing').then(m => m.ORDER_ROUTING),
        canActivate: [ngxPermissionsGuard],
        data: {
          breadcrumb: 'Заказы',
          permissions: {
            only: 'OrderList',
            redirectTo: 'merchant',
          },
        },
      },
      {
        path: 'merchant',
        loadChildren: (): any =>
          import('../merchant-container/merchant-container.routing').then(m => m.MERCHANT_CONTAINER),
        canActivate: [NgxPermissionsGuard],
        data: {
          breadcrumb: 'Торговые точки',
          permissions: {
            only: 'MerchantList',
            redirectTo: '/merchant',
          },
        },
      },
      {
        path: 'withdrawal-amount',
        loadChildren: (): any =>
          import('./../withdrawal-amount/withdrawal-amount.routing').then(m => m.WITHDRAWAL_AMOUNT_ROUTING),
        data: {
          breadcrumb: 'Вывод',
        },
      },
      {
        path: 'user',
        loadChildren: (): any =>
          import('./../user-container/user-container.routing').then(m => m.USER_CONTAINER_ROUTING),
        canActivate: [NgxPermissionsGuard],
        data: {
          breadcrumb: 'Пользователи',
          permissions: {
            only: 'UserList',
            redirectTo: 'help',
          },
        },
      },
      {
        path: 'help',
        loadChildren: (): any => import('./../support-center/support-center.routing').then(m => m.SupportCenterRouting),
        canActivate: [NgxPermissionsGuard],
        data: {
          breadcrumb: 'Помощь',
          permissions: {
            only: 'SupportApplicationList',
            redirectTo: 'report',
          },
        },
      },
      {
        path: 'report',
        loadComponent: (): any => import('./../report/report.component').then(c => c.ReportComponent),
        canActivate: [NgxPermissionsGuard],
        data: {
          breadcrumb: 'Отчеты',
          permissions: {
            only: 'ReportDictionary',
            redirectTo: 'setting',
          },
        },
      },
      {
        path: 'setting',
        loadComponent: (): any => import('./../setting/setting.component').then(c => c.SettingComponent),
        canActivate: [NgxPermissionsGuard],
        data: {
          breadcrumb: 'Настройки',
          permissions: {
            only: 'CompanyIntegrationConfiguration',
            redirectTo: 'access-denied',
          },
        },
      },
      {
        path: 'payments-refund-applications',
        loadComponent: (): any =>
          import('../payments-refund-applications/payments-refund-applications.component').then(
            m => m.PaymentsRefundApplicationsComponent
          ),
        canActivate: [NgxPermissionsGuard],
        data: {
          breadcrumb: 'Завки на возврат',
          permissions: {
            only: 'PaymentRefundApplicationList',
            redirectTo: 'access-denied',
          },
        },
      },
      {
        path: 'access-denied',
        component: AccessDeniedComponent,
      },
    ],
  },
];
