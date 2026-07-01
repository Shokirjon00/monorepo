import {Routes} from '@angular/router';
import {DeviceTypeComponent} from '@modules/directory/device-type/device-type.component';
import {
  DeviceTypeEditComponent
} from '@modules/directory/device-type/device-type-detail/device-type-edit/device-type-edit.component';
import {ComponentGuard} from '@eskhata/util';

export const DEVICE_TYPE_ROUTES: Routes = [
  {
    path: '',
    component: DeviceTypeComponent,
    data: {breadcrumb: 'Тип устройств'}
  },
  {
    path: 'new',
    component: DeviceTypeEditComponent,
    data: {breadcrumb: 'Добавление'}
  },
  {
    path: 'edit/:id',
    component: DeviceTypeEditComponent,
    canDeactivate: [ComponentGuard],
    data: {breadcrumb: 'Редактирование'}
  },
];
