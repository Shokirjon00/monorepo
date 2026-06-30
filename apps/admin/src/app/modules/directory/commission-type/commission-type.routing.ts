import {Routes} from '@angular/router';

export const COMMISSION_TYPE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: (): any => import('./commission-type.component').then(c => c.CommissionTypeComponent),
    data: {breadcrumb: {skip: true}},
  }
];
