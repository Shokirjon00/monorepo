import {Routes} from '@angular/router';

export const MAIN_JOURNAL_ROUTING: Routes = [
  {
    path: '',
    loadComponent: (): any => import('./main-journal.component').then(c => c.MainJournalComponent),
    data: {
      breadcrumb: {skip: true}
    },
  },
  {
    path: ':jobLogId',
    loadChildren: (): any => import('./job-log-detail/job-log-detail.routing').then(m => m.MAIN_JOURNAL_DETAIL_ROUTING),
    data: {
      breadcrumb : 'Просмотр'
    }
  }
]
