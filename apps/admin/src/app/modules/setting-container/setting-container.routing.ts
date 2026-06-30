import {Routes} from '@angular/router';
import {SettingContainerComponent} from '@modules/setting-container/setting-container.component';

export const SETTING_ROUTES: Routes = [
  {
    path: '',
    component: SettingContainerComponent,
    children: [
      {
        path: '',
        redirectTo: 'system',
        pathMatch: 'full'
      },
      {
        path: 'system',
        loadChildren: (): any => import('./setting/setting.routing').then(m => m.SETTING_ROUTING),
        data: {breadcrumb: 'Системные настройки'},

      },
      {
        path: 'report',
        loadChildren: (): any => import('./setting-report/setting-report.routing').then(m => m.SETTING_REPORT_ROUTING),
        data: {breadcrumb: 'Настройки отчётов'},
      },
      {
        path: 'gateways',
        loadChildren: (): any => import('./gateways/gateways.routing').then(m => m.GATEWAYS_ROUTING),
        data: {breadcrumb: 'Шлюзы'},
      }
    ]
  },
];

