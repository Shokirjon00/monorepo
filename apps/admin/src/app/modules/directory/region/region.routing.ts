import {Routes} from '@angular/router';
import {RegionComponent} from '@modules/directory/region/region.component';
import {RegionEditComponent} from '@modules/directory/region/region-detail/region-edit/region-edit.component';
import {RegionInfoComponent} from '@modules/directory/region/region-detail/region-info/region-info.component';
import {ComponentGuard} from '@eskhata/util';

export const REGION_ROUTES: Routes = [
  {
    path: '',
    component: RegionComponent,
    data: {breadcrumb: 'Регион'}
  },
  {
    path: 'new',
    component: RegionEditComponent,
    data: {breadcrumb: 'Добавление'}
  },
  {
    path: 'edit/:id',
    component: RegionEditComponent,
    canDeactivate: [ComponentGuard],
    data: {breadcrumb: 'Редактирование'}
  },
  {
    path: 'info/:id',
    component: RegionInfoComponent,
    data: {breadcrumb: 'Информация'}
  },
];

