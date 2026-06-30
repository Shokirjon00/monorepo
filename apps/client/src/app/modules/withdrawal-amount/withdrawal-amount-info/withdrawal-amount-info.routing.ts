import { Routes } from "@angular/router";

export const WITHDRAWAL_AMOUNT_INFO_ROUTING: Routes = [
  {
    path: '',
    loadComponent: (): any => import('./withdrawal-amount-info.component').then(m => m.WithdrawalAmountInfoComponent),
    data: {
      breadcrumb : "Реестр вывода средств"
    }
  },
]
