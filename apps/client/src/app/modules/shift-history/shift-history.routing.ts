import { Routes } from "@angular/router";

export const SHIFT_HISTORY_ROUTING: Routes = [
  {
    path: '',
    loadComponent: (): any => import('./shift-history.component').then(m => m.ShiftHistoryComponent)
  },
  {
    path: ':id',
    loadComponent: (): any => import('./shift-history-info/shift-history-info.component').then(c => c.ShiftHistoryInfoComponent),
    data: {breadcrumb: {alias: 'shiftDetail'}},
  }
]
