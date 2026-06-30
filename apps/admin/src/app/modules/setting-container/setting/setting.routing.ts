import { Routes } from '@angular/router';
import { SettingComponent } from './setting.component';
import { SettingEditComponent } from '@modules/setting-container/setting/setting-edit/setting-edit.component';

export const SETTING_ROUTING: Routes = [
  {
    path: '',
    component: SettingComponent
  },
  {
    path: 'edit/:id',
    component: SettingEditComponent,
    data: {
      breadcrumb: 'Редактирование',
    }
  },
  {
    path: 'setting/:id',
    loadComponent: (): any => import ('./setting-components/setting-components.component').then(c => c.SettingComponentsComponent),
    data: {
      breadcrumb: 'Настройки компонентов',
    }
  },

  {
    path: 'info/:id',
    loadComponent: (): any => import ('./setting-info/setting-info.component').then(c => c.SettingInfoComponent),
    data: {
      breadcrumb: 'Информация',
    }
  }
]
