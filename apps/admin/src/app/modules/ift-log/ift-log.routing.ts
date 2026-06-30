import {Routes} from '@angular/router';

export const IFT_LOG_ROUTING: Routes = [
  {
    path: '',
    loadComponent: (): any => import('./ift-log.component').then(m => m.IftLogComponent)
  },
  {
    path: ':iftLogId',
    loadComponent: (): any => import('./ift-log-info/ift-log-info.component').then(c => c.IftLogInfoComponent),
    data: {breadcrumb: {alias: 'iftLogDetail'}},
  }
]
