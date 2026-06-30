import {Routes} from '@angular/router';
import {ComponentGuard} from '@core/guards/component.guard';
import {CompanySegmentComponent} from '@modules/directory/company-segment/company-segment.component';
import {
  CompanySegmentEditComponent
} from '@modules/directory/company-segment/company-segment-detail/company-segment-edit/company-segment-edit.component';
import {
  CompanySegmentInfoComponent
} from '@modules/directory/company-segment/company-segment-detail/company-segment-info/company-segment-info.component';

export const COMPANY_SEGMENT_ROUTING: Routes = [
  {
    path: '',
    component: CompanySegmentComponent,
    data: {breadcrumb: 'Сегмент организации'},
  },
  {
    path: 'new',
    component: CompanySegmentEditComponent,
    data: {breadcrumb: 'Добавление сегмента'}
  },
  {
    path: 'edit/:segmentId',
    component: CompanySegmentEditComponent,
    canDeactivate: [ComponentGuard],
    data: {breadcrumb: 'Редактирование сегмента'}
  },
  {
    path: 'info/:segmentId',
    component: CompanySegmentInfoComponent,
    data: {breadcrumb: 'Информация об сегменте'}
  },
]
