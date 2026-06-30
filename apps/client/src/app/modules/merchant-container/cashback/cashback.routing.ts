import { Routes } from "@angular/router";
import { CashbackComponent } from "@modules/merchant-container/cashback/cashback.component";
import { CashbackDetailComponent } from "@modules/merchant-container/cashback/cashback-detail/cashback-detail.component";
import { NgxPermissionsGuard } from "ngx-permissions";

export const CASHBACK_ROUTING: Routes = [
  {
    path: '',
    component: CashbackComponent,
    canActivate: [NgxPermissionsGuard],
    data: {
      breadcrumb: 'Кэшбэки',
      permissions: {
        only: 'CashbackCompanyList',
        redirectTo: '/access-denied'
      }
    },
  },
  {
    path: 'detail/:cashbackId',
    component: CashbackDetailComponent,
    data: {
      breadcrumb: 'Просмотр',
      permissions: {
        only: 'CashbackCompanyDetail',
        redirectTo: '/access-denied'
      }
    }
  }
]
