import {Routes} from '@angular/router';
import {MainComponent} from './main.component';
import {ngxPermissionsGuard} from 'ngx-permissions';
import {AccessDeniedComponent} from '@modules/status-pages/access-denied/access-denied.component';

export const MAIN_ROUTES: Routes = [
  {
    path: '',
    component: MainComponent,
    children: [
      {
        path: '',
        redirectTo: 'analytics',
        pathMatch: 'full'
      },
      {
        path: 'analytics',
        loadChildren: (): any => import('./../analytics/analytics.routing').then(m => m.ANALYTICS_ROUTES),
        canActivate: [ngxPermissionsGuard],
        data: {
          breadcrumb: 'Аналитика',
          permissions: {
            only: 'Analytic',
            redirectTo: 'clients',
            pathMatch: 'full'
          }
        }
      },
      {
        path: 'clients',
        loadChildren: (): any => import('./../client/client.routing').then(m => m.CLIENT_ROUTES),
        data: {
          breadcrumb: 'Клиенты'
        }
      },
      {
        path: 'main-terminal',
        loadChildren: (): any => import('./../main-terminal/main-terminal.routing').then(m => m.MAIN_TERMINAL_ROUTING),
        canActivate: [ngxPermissionsGuard],
        data: {
          breadcrumb: 'POS-терминал',
          permissions: {
            only: 'PosTerminalList',
            redirectTo: 'access-denied'
          }
        }
      },

      {
        path: 'transactions',
        loadChildren: (): any => import('../transactions/transactions.routing').then(m => m.PAYMENTS),
        canActivate: [ngxPermissionsGuard],
        data: {
          breadcrumb: 'Платежи',
          permissions: {
            only: 'PaymentList',
            redirectTo: 'access-denied'
          }
        }
      },

      {
        path: 'advance',
        loadChildren: (): any => import('../advance-payments/advance.routing').then(m => m.ADVANCE_ROUTES),
        canActivate: [ngxPermissionsGuard],
        data: {
          breadcrumb: 'Авансовые выплаты',
          permissions: {
            only: 'AdvancePayoutList',
            redirectTo: 'access-denied'
          }
        }
      },

      {
        path: 'job-log',
        loadChildren: (): any => import('../job-log/job-log.routing').then(m => m.JOB_LOG_ROUTING),
        canActivate: [ngxPermissionsGuard],
        data: {
          breadcrumb: 'Журнал',
          permissions: {
            only: 'JobLogList',
            redirectTo: 'access-denied'
          }
        }
      },
      {
        path: 'ift-log',
        loadChildren: (): any => import('./../ift-log/ift-log.routing').then(m => m.IFT_LOG_ROUTING),
        canActivate: [ngxPermissionsGuard],
        data: {
          breadcrumb: 'Журнал событий IFT',
          permissions: {
            only: 'InOutIFTRequestLogList',
            redirectTo: 'access-denied'
          }
        }
      },
      {
        path: 'mailing',
        loadChildren: (): any => import('./../mailing/mailing.routing').then(m => m.MAILING_ROUTING),
        canActivate: [ngxPermissionsGuard],
        data: {
          breadcrumb: 'Рассылки',
          permissions: {
            only: 'MailingList',
            redirectTo: 'access-denied'
          }
        }
      },
      {
        path: 'bank-promotion',
        loadChildren: (): any => import('./../bank-promotion/bank-promotion.routing').then(m => m.BANK_PROMOTION_ROUTING),
        canActivate: [ngxPermissionsGuard],
        data: {
          breadcrumb: 'Акции банка',
          permissions: {
            only: 'CashbackPromotionList',
            redirectTo: 'access-denied'
          }
        }
      },
      {
        path: 'promotion-system',
        loadChildren: (): any => import('./../sms-notification/sms-notification.routing').then(m => m.SETTING_ROUTES),
        data: {
          breadcrumb: 'SMS и уведомления'
        }
      },
      {
        path: 'withdrawal-amount',
        loadChildren: (): any => import('./../withdrawal-amount/withdrawal-amount.routing').then(m => m.WITHDRAWAL_AMOUNT_ROUTING),
        data: {
          breadcrumb: 'Вывод'
        }
      },
      {
        path: 'register',
        loadChildren: (): any => import('../register/register.routing').then(m => m.REGISTER_ROUTING),
        data: {
          breadcrumb: 'Реестры'
        }
      },
      {
        path: 'company-registration-applications',
        loadChildren: (): any => import('../company-registration/company-registration.routing').then(m => m.REGISTRATION_ROUTING),
        data: {
          breadcrumb: 'Заявки на подключение'
        }
      },
      {
        path: 'report',
        loadChildren: () => import('../report/report.routing').then(m => m.REPORT_ROUTING),
        data: {
          breadcrumb: 'Отчеты'
        }
      },
      {
        path: 'services',
        loadChildren: () => import('../service/service.routing').then(m => m.SERVICES_ROUTES),
        data: {
          breadcrumb: 'Сервисы',
          permissions: {
            only: 'ServiceList',
            redirectTo: 'access-denied'
          }
        }
      },
      {
        path: 'order',
        loadChildren: () => import('../order/order.routing').then(m => m.ORDERS),
        data: {
          breadcrumb: 'Заказы',
          permissions: {
            only: 'OrderList',
            redirectTo: 'access-denied'
          }
        }
      },
      {
        path: 'balance-limit',
        loadChildren: (): any => import('./../balance-limit/balance-limit.routing').then(m => m.BALANCE_LIMIT),
        data: {
          breadcrumb: 'Лимиты'
        }
      },
      {
        path: 'user',
        loadChildren: (): any => import('./../user/user.routing').then(m => m.USER_ROUTING),
        data: {
          breadcrumb: 'Пользователи'
        }
      },
      {
        path: 'continue-rules',
        loadChildren: (): any => import('./../payment-continue-rules/payment-continue-rules.routing').then(m => m.PAYMENT_CONTINUE_RULES_ROUTING),
        canActivate: [ngxPermissionsGuard],
        data: {
          animation: true,
          breadcrumb: 'Продолжения платежа',
          permissions: {
            only: 'PaymentContinueRuleList',
            redirectTo: 'access-denied'
          }
        }
      },
      {
        path: 'directory',
        loadChildren: (): any => import('./../directory/directory.routing').then(m => m.DIRECTORY),
        data: {
          breadcrumb: 'Справочник'
        }
      },
      {
        path: 'setting',
        loadChildren: (): any => import('../setting-container/setting-container.routing').then(m => m.SETTING_ROUTES),
        data: {
          breadcrumb: 'Настройки',
          permissions: {
            only: 'SettingList',
            redirectTo: 'access-denied'
          }
        }
      },
      {
        path: 'payments-refund-applications',
        loadComponent: (): any => import('../payments-refund-applications/payments-refund-applications.component').then(m => m.PaymentsRefundApplicationsComponent),
        canActivate: [ngxPermissionsGuard],
        data: {
          breadcrumb: 'Завки на возврат',
          permissions: {
            only: 'PaymentRefundApplicationList',
            redirectTo: 'access-denied'
          }
        }
      },
      {
        path: 'help',
        loadChildren: (): any => import('../support-center/support-center.routing').then(m => m.SupportCenterRouting),
        canActivate: [ngxPermissionsGuard],
        data: {
          breadcrumb: 'Помощь',
          permissions: {
            only: 'SupportApplicationList',
            redirectTo: 'access-denied'
          }
        }
      },
      {
        path: 'access-denied',
        component: AccessDeniedComponent
      }
    ]
  }
];
