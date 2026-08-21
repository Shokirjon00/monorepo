import { Routes } from "@angular/router";

export const GATEWAYS_ROUTING: Routes = [
  {
    path: '',
    loadComponent: (): any => import('./gateways.component').then(c => c.GatewaysComponent),
  },
  {
    path: 'edit/:id',
    loadComponent: (): any => import('./gataways-edit/gataways-edit.component').then(c => c.GatawaysEditComponent),
    data: {
      breadcrumb: 'Редактирование',
    }
  }
]
