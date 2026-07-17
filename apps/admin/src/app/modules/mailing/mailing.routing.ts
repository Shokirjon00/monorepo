import {Routes} from '@angular/router';
import {ComponentGuard} from '@eskhata/util';
import {NgxPermissionsGuard} from 'ngx-permissions';

export const MAILING_ROUTING: Routes = [
  {
    path: '',
    loadComponent: (): any => import('./mailing.component').then(m => m.MailingComponent)
  },
  {
    path: 'new',
    loadComponent: (): any => import('./mailing-edit/mailing-edit.component').then(m => m.MailingEditComponent),
    canActivate: [NgxPermissionsGuard],
    data: {
      breadcrumb: 'Добавление',
      permissions: {
        only: 'MailingCreate',
        redirectTo: '/access-denied'
      }
    }
  },
  {
    path: ':mailingId',
    loadComponent: (): any => import('./mailing-detail/mailing-detail.component').then(m => m.MailingDetailComponent),
    data: {breadcrumb: {skip: true}},
    children: [
      {
        path: 'edit',
        loadComponent: (): any => import('./mailing-edit/mailing-edit.component').then(m => m.MailingEditComponent),
        canDeactivate: [ComponentGuard],
        canActivate: [NgxPermissionsGuard],
        data: {
          breadcrumb: 'Редактирование',
          permissions: {
            only: 'MailingUpdate',
            redirectTo: '/access-denied'
          }
        }
      },
      {
        path: 'info',
        loadComponent: (): any => import('./mailing-detail/mailing-info/mailing-info.component').then(m => m.MailingInfoComponent),
        canActivate: [NgxPermissionsGuard],
        data: {
          breadcrumb: 'Информация',
          permissions: {
            only: 'MailingDetail',
            redirectTo: '/access-denied'
          }
        }
      },
    ]
  }
];
