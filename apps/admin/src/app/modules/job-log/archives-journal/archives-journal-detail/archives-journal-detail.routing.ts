import {Routes} from '@angular/router';

export const ARCHIVES_JOURNAL_DETAIL_ROUTING: Routes = [
  {
    path: '',
    loadComponent: (): any => import('./archives-journal-detail.component').then(c => c.ArchivesJournalDetailComponent),
    children: [
      {
        path: '',
        redirectTo: 'info',
        pathMatch: 'full'
      },
      {
        path: 'info',
        loadComponent: (): any => import('./archives-journal-info/archives-journal-info.component').then(c => c.ArchivesJournalInfoComponent),
        data: {breadcrumb: {skip: true}}
      }
    ]
  }
]
