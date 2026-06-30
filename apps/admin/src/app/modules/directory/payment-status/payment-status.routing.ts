import { Routes } from "@angular/router";
import { ngxPermissionsGuard } from "ngx-permissions";
import { ComponentGuard } from "@core/guards/component.guard";

export const PAYMENT_STATUS_ROUTING: Routes = [
  {
    path: '',
    loadComponent: (): any => import('./payment-status.component').then(c => c.PaymentStatusComponent),
    data: {breadcrumb: 'Детальный статус платежей'}
  },
  {
    path: 'new',
    loadComponent: (): any => import('./payment-status-edit/payment-status-edit.component').then(c => c.PaymentStatusEditComponent),
    canActivate: [ngxPermissionsGuard],
    data: {
      breadcrumb: 'Добавление',
      permissions: {
        only: 'PaymentStatusDetailCreate',
        redirectTo: '/access-denied'
      }
    }
  },
  {
    path: 'edit/:id',
    loadComponent: (): any => import('./payment-status-edit/payment-status-edit.component').then(c => c.PaymentStatusEditComponent),
    canActivate: [ngxPermissionsGuard],
    canDeactivate: [ComponentGuard],
    data: {
      breadcrumb: 'Редактирование',
      permissions: {
        only: 'PaymentStatusDetailUpdate',
        redirectTo: '/access-denied'
      }
    }
  },
  {
    path: 'info/:id',
    loadComponent: (): any => import('./payment-status-info/payment-status-info.component').then(c => c.PaymentStatusInfoComponent),
    canActivate: [ngxPermissionsGuard],
    data: {
      breadcrumb: 'Информация',
      permissions: {
        only: 'PaymentStatusDetailDetail',
        redirectTo: '/access-denied'
      }
    }
  },
];
