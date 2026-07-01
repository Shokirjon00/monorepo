import { BankPromotionDetailComponent } from '@modules/bank-promotion/bank-promotion-detail/bank-promotion-detail.component';
import { Routes } from '@angular/router';
import { ComponentGuard } from '@eskhata/util';
import { NgxPermissionsGuard } from 'ngx-permissions';
import { BankPromotionInfoComponent } from '@modules/bank-promotion/bank-promotion-detail/bank-promotion-info/bank-promotion-info.component';


export const ROUTING: Routes = [
  {
    path: '',
    component: BankPromotionDetailComponent,
    children: [
      {
        path: 'edit',
        loadComponent: (): any => import('./../bank-promotion-edit/bank-promotion-edit.component').then(c => c.BankPromotionEditComponent),
        canDeactivate: [ComponentGuard],
        canActivate: [NgxPermissionsGuard],
        data: {
          breadcrumb: 'Редактирование',
          permissions: {
            only: 'CashbackPromotionUpdate',
            redirectTo: '/access-denied'
          }
        }
      },
      {
        path: 'info',
        component: BankPromotionInfoComponent,
        canActivate: [NgxPermissionsGuard],
        data: {
          breadcrumb: 'Информация',
          permissions: {
            only: 'CashbackPromotionDetail',
            redirectTo: '/access-denied'
          }
        }
      },
    ]
  }
]
