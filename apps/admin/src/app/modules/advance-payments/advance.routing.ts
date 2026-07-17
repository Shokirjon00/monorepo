import { Routes } from "@angular/router";
import { ngxPermissionsGuard } from "ngx-permissions";

export const ADVANCE_ROUTES: Routes = [
  {
    path: '',
    loadComponent:(): any=> import('./advance-payments.component').then((c) => c.AdvancePaymentsComponent),
    children: [
      {
        path: '',
        redirectTo: 'advance-payments',
        pathMatch: 'full'
      },
      {
        path: 'advance-payments',
        loadChildren: (): any => import('./advance-payments-page/advance-payments-page.routing').then(m => m.AdvancePaymentsPageRouting),
        canActivate:[ngxPermissionsGuard],
        data: {
          breadcrumb: 'Авансовые выплаты',
          permissions: {
            only: 'AdvancePayoutList',
            redirectTo: '/access-denied'
          }
        }
      },
      {
        path: 'advance-commissions',
        loadChildren:(): any => import('./advance-commissions/advance-commissions.routing').then(m=> m.AdvanceCommissionsRouting),
        canActivate:[ngxPermissionsGuard],
        data: {
          breadcrumb: 'Авансовые комиссии',
          permissions: {
            only: 'CommissionAdvanceList',
            redirectTo: '/access-denied'
          }
        }
      },
      {
        path: 'allow-list',
        loadChildren: (): any => import('./allow-list/allow-list.routing').then(m => m.AllowListRouting),
        canActivate:[ngxPermissionsGuard],
        data: {
          breadcrumb: 'Белый список',
          permissions: {
            only: 'AdvancePayoutOfferList',
            redirectTo: '/access-denied'
          }
        }
      }
    ]
  }
]
