import {Routes} from '@angular/router';
import {ComponentGuard} from '@core/guards/component.guard';

export const SERVICES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: (): any => import('../service/service.component').then(m => m.ServiceComponent),
    data: {
      breadcrumb: 'Сервисы',
      permissions: {
        only: 'ServiceList'
      }
    }
  },
  {
    path: 'new',
    loadComponent: (): any => import('./service-edit/services-edit.component').then(m => m.ServicesEditComponent),
    data: {
      breadcrumb: 'Добавление',
      permissions: {
        only: 'ServiceCreate'
      }
    }
  },
  {
    path: 'edit/:id',
    loadComponent: (): any => import('./service-edit/services-edit.component').then(m => m.ServicesEditComponent),
    canDeactivate: [ComponentGuard],
    data: {
      breadcrumb: 'Редактирование',
      permissions: {
        only: 'ServiceUpdate'
      }
    }
  },
  {
    path: 'info/:id',
    loadComponent: (): any => import('@modules/service/service-info/services-info.component').then(m => m.ServicesInfoComponent),
    data: {
      breadcrumb: 'Информация',
      permissions: {
        only: 'ServiceDetail'
      }
    }
  },
];

