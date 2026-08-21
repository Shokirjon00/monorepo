import { Routes } from '@angular/router';
import { NgxPermissionsGuard } from "ngx-permissions";

export const ADVANCE_PAYMENTS: Routes = [
  {
    path: '',
    loadComponent: (): any => import('./advance-payments.component').then(c => c.AdvancePaymentsComponent),
    canActivate: [NgxPermissionsGuard],
    data: {
      breadcrumb: 'Авансовые выплаты',
      permissions: {
        only: 'AdvancePayoutList',
        redirectTo: '/access-denied'
      }
    }
  },
  {
    path: 'conditions',
    loadComponent: (): any =>import('./deal-conditions/deal-conditions.component').then(c => c.DealConditionsComponent),
    canActivate: [NgxPermissionsGuard],
    data: {
      breadcrumb: 'Оформление аванса',
      permissions: {
        redirectTo: '/access-denied'
      }
    }
  },
  {
    path: 'info/:id',
    loadComponent: (): any =>import('./advance-payments-info/advance-payments-info.component').then(c => c.AdvancePaymentsInfoComponent),
    data: {breadcrumb: {skip: true}},
  }
]
