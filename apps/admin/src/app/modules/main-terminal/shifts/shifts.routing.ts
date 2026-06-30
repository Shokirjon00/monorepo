import { Routes } from '@angular/router';

export const SHIFTS_ROUTING: Routes = [
  {
    path: '',
    loadComponent: (): any => import('./shifts.component').then(c => c.ShiftsComponent),
  },
  {
    path: ':shiftsId',
    loadChildren: (): any => import('./shifts-detail/shifts-detail.routing').then(m => m.SHIFTS_DETAIL_ROUTING),
    data: {breadcrumb: {skip: true}},
  }
];
