import {Routes} from '@angular/router';
import {ComponentGuard} from '@core/guards/component.guard';
import {NgxPermissionsGuard} from 'ngx-permissions';

export const APPLICATION_STATUS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: (): any => import('./application-status.component').then(c => c.ApplicationStatusComponent),
    data: {breadcrumb: 'Статус заявки'}
  },
  {
    path: 'new',
    loadComponent: (): any => import('./application-status-detail/application-status-edit/application-status.component').then(c => c.ApplicationStatusEditComponent),
    canActivate: [NgxPermissionsGuard],
    data: {
      breadcrumb: 'Добавление',
      permissions: {
        only: '',
        redirectTo: '/access-denied'
      }
    }
  },
  {
    path: 'edit/:id',
    loadComponent: (): any => import('./application-status-detail/application-status-edit/application-status.component').then(c => c.ApplicationStatusEditComponent),
    canDeactivate: [ComponentGuard],
    canActivate: [NgxPermissionsGuard],
    data: {
      breadcrumb: 'Редактирование',
      permissions: {
        only: '',
        redirectTo: '/access-denied'
      }
    }
  },
  {
    path: 'info/:id',
    loadComponent: (): any => import('./application-status-detail/application-status-info/application-status.component').then(c => c.ApplicationStatusInfoComponent),
    canActivate: [NgxPermissionsGuard],
    data: {
      breadcrumb: 'Информация',
      permissions: {
        only: '',
        redirectTo: '/access-denied'
      }
    }
  },
];
