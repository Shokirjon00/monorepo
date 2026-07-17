import { Routes } from '@angular/router';
import { BankPromotionComponent } from '@modules/bank-promotion/bank-promotion.component';
import { NgxPermissionsGuard } from 'ngx-permissions';

export const BANK_PROMOTION_ROUTING: Routes = [
  {
    path: '',
    component: BankPromotionComponent,
  },
  {
    path: 'new',
    loadComponent: (): any => import('./bank-promotion-edit/bank-promotion-edit.component').then(c => c.BankPromotionEditComponent),
    canActivate: [NgxPermissionsGuard],
    data: {
      breadcrumb: 'Добавление',
      permissions: {
        only: 'CashbackPromotionCreate',
        redirectTo: '/access-denied'
      }
    }
  },
  {
    path: ':bankPromotionId',
    loadChildren: (): any => import('./bank-promotion-detail/bank-promotion-detail.routing').then(m => m.ROUTING),
    data: {breadcrumb: {skip: true}},
  }
];
