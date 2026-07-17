import {Routes} from '@angular/router';
import {SettingReportComponent} from './setting-report.component';
import {
  SettingReportEditComponent
} from '@modules/setting-container/setting-report/setting-report-edit/setting-report-edit.component';

export const SETTING_REPORT_ROUTING: Routes = [
  {
    path: '',
    component: SettingReportComponent
  },
  {
    path: 'edit/:id',
    component: SettingReportEditComponent,
    data: {
      breadcrumb: 'Редактирование',
    }
  }
]
