import {Routes} from '@angular/router';
import {NgxPermissionsGuard} from 'ngx-permissions';
import {ComponentGuard} from '@eskhata/util';
import { PaymentContinueRulesComponent } from '@modules/payment-continue-rules/payment-continue-rules.component';
import { PaymentContinueRulesEditComponent } from '@modules/payment-continue-rules/payment-continue-rules-detail/payment-continue-rules-edit/payment-continue-rules-edit.component';
import { PaymentContinueRulesDetailComponent } from '@modules/payment-continue-rules/payment-continue-rules-detail/payment-continue-rules-detail.component';
import { PaymentContinueRulesInfoComponent } from '@modules/payment-continue-rules/payment-continue-rules-detail/payment-continue-rules-info/payment-continue-rules-info.component';
import { AccordanceDetailComponent } from '@modules/payment-continue-rules/payment-continue-rules-detail/accordance-detail/accordance-detail.component';
import { AccordanceEditComponent } from '@modules/payment-continue-rules/payment-continue-rules-detail/accordance-detail/accordance-edit/accordance-edit.component';

export const PAYMENT_CONTINUE_RULES_ROUTING: Routes = [
  {
    path: '',
    component: PaymentContinueRulesComponent,
    data: {
      breadcrumb: 'Продолжение платежей',
    },
  },
  {
    path: 'new',
    component: PaymentContinueRulesEditComponent,
    canActivate: [NgxPermissionsGuard],
    data: {
      breadcrumb: 'Добавление',
      permissions: {
        only: 'PaymentContinueRuleCreate',
        redirectTo: '/access-denied'
      }
    }
  },
  {
    path: ':rulesId',
    component: PaymentContinueRulesDetailComponent,
    data: {
      breadcrumb: 'Редактирование',
    },
    children: [
      {
        path: '',
        redirectTo: 'info',
        pathMatch: 'full'
      },
      {
        path: 'edit',
        component: PaymentContinueRulesEditComponent,
        canDeactivate: [ComponentGuard],
        canActivate: [NgxPermissionsGuard],
        data: {
          breadcrumb: {skip: true},
          permissions: {
            only: 'PaymentContinueRuleUpdate',
            redirectTo: '/access-denied'
          }
        }
      },
      {
        path: 'info',
        component: PaymentContinueRulesInfoComponent,
        canActivate: [NgxPermissionsGuard],
        data: {
          breadcrumb: 'Информация о продолжении платежей',
          permissions: {
            only: 'PaymentContinueRuleDetail',
            redirectTo: '/access-denied'
          }
        }
      },
      {
        path: 'accordance',
        component: AccordanceDetailComponent,
        data: {
          breadcrumb: {skip: true},
        },
        children: [
          {
            path: 'new',
            component: AccordanceEditComponent,
            canActivate: [NgxPermissionsGuard],
            data: {
              breadcrumb: 'Соответствие к правилам продолжениям транзакции',
              permissions: {
                only: 'PaymentContinueRuleAccordanceCreate',
                redirectTo: '/access-denied',
              }
            }
          },
          {
            path: 'edit/:accordanceId',
            component: AccordanceEditComponent,
            canDeactivate: [ComponentGuard],
            canActivate: [NgxPermissionsGuard],
            data: {
              breadcrumb: 'Соответствие к правилам продолжениям транзакции',
              permissions: {
                only: 'PaymentContinueRuleAccordanceUpdate',
                redirectTo: '/access-denied',
              }
            }
          }
        ]
      },

    ]
  },
];
