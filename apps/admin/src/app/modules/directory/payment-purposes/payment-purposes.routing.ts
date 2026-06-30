import {Routes} from '@angular/router';
import {PaymentPurposesComponent} from '@modules/directory/payment-purposes/payment-purposes.component';
import {ComponentGuard} from '@core/guards/component.guard';
import {NgxPermissionsGuard} from 'ngx-permissions';
import {
  PaymentPurposesEditComponent
} from "@modules/directory/payment-purposes/payment-purposes-edit/payment-purposes-edit.component";

export const DESTINATION_TEMPLATE_ROUTES: Routes = [
  {
    path: '',
    component: PaymentPurposesComponent,
    data: {breadcrumb: 'Шаблон назначения'}
  },
  {
    path: 'new',
    component: PaymentPurposesEditComponent,
    canActivate: [NgxPermissionsGuard],
    data: {
      breadcrumb: 'Добавление',
      permissions: {
        only: 'PaymentPurposeCreate',
        redirectTo: '/access-denied'
      }
    }
  },
  {
    path: 'edit/:id',
    component: PaymentPurposesEditComponent,
    canDeactivate: [ComponentGuard],
    canActivate: [NgxPermissionsGuard],
    data: {
      breadcrumb: 'Редактирование',
      permissions: {
        only: 'PaymentPurposeUpdate',
        redirectTo: '/access-denied'
      }
    }
  },
];
