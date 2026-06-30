import {Routes} from '@angular/router';

export const MAIN_JOURNAL_DETAIL_ROUTING: Routes = [
  {
    path: '',
    loadComponent: (): any => import('./job-log-detail.component').then(c => c.JobLogDetailComponent),
    children: [
      {
        path: '',
        redirectTo: 'info',
        pathMatch: 'full'
      },
      {
        path: 'info',
        loadComponent: (): any => import('@modules/job-log/job-log/job-log-detail/main-journal-info/main-journal-info.component').then(c => c.MainJournalInfoComponent),
        data: {breadcrumb: {skip: true}}
      }
    ]
  }
]
