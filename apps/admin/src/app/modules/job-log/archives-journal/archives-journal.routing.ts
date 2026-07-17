import {Routes} from '@angular/router';

export const ARCHIVES_JOURNAL_ROUTING: Routes = [
  {
    path: '',
    loadComponent: (): any => import('./archives-journal.component').then(c => c.ArchivesJournalComponent),
  },
  {
    path: ':jobLogId',
    loadChildren: (): any => import('./archives-journal-detail/archives-journal-detail.routing').then(m => m.ARCHIVES_JOURNAL_DETAIL_ROUTING),
    data: {breadcrumb: 'Просмотр'},
  }
]
