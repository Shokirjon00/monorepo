import { Routes } from "@angular/router";

export const AdvancePaymentsPageRouting: Routes = [
  {
    path: '',
    loadComponent: (): any => import('./advance-payments-page.component').then(m => m.AdvancePaymentsPageComponent),
  }
]
