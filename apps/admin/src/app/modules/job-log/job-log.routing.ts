import { Routes } from '@angular/router';
import { ngxPermissionsGuard } from "ngx-permissions";

export const JOB_LOG_ROUTING: Routes = [
  {
    path: '',
    loadComponent: (): any => import('./job-log.component').then(c => c.JobLogComponent),
    children: [
      {
        path: '',
        redirectTo: 'main-journal',
        pathMatch: 'full'
      },
      {
        path: 'main-journal',
        loadChildren: (): any => import('./job-log/main-journal.routing').then(m => m.MAIN_JOURNAL_ROUTING),
        canActivate: [ngxPermissionsGuard],
        data: {
          breadcrumb: 'Основной журнал',
          permissions: {
            only: 'JobLogList',
            redirectTo: '/access-denied'
          }
        },
      },
      {
        path: 'archives-journal',
        loadChildren: (): any => import('./archives-journal/archives-journal.routing').then(m => m.ARCHIVES_JOURNAL_ROUTING),
        canActivate: [ngxPermissionsGuard],
        data: {
          breadcrumb: 'Журнал архивов',
          permissions: {
            only: 'JobLogDWHList',
            redirectTo: '/access-denied'
          }
        },
      },
    ]
  },
];

