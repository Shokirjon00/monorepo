import { Routes } from '@angular/router';
import { CompanyComponent } from './company.component';

export const COMPANY_ROUTES: Routes = [
  {
    path: '',
    component: CompanyComponent,
  },
  {
    path: 'new',
    loadComponent: (): any => import('./company-edit/company-edit.component').then(c => c.CompanyEditComponent),
    data: {
      breadcrumb: 'Добавить организацию'
    }
  },
  {
    path: ':companyId',
    loadChildren: (): any => import('./company-detail/company-detail.routing').then(m => m.COMPANY_DETAIL_ROUTES),
    data: {
      breadcrumb: {alias: 'companyDetail'}
    },
  },
];
