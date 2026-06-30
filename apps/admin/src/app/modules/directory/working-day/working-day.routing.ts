import {Routes} from '@angular/router';
import {WorkingDayComponent} from '@modules/directory/working-day/working-day.component';
import {
  WorkingDayEditComponent
} from '@modules/directory/working-day/working-day-detail/working-day-edit/working-day-edit.component';
import {ComponentGuard} from '@core/guards/component.guard';

export const WORKING_DAY_ROUTES: Routes = [
  {
    path: '',
    component: WorkingDayComponent,
    data: {breadcrumb: 'Рабочие дни'}
  },
  {
    path: 'new',
    component: WorkingDayEditComponent,
    data: {breadcrumb: 'Добавление'}
  },
  {
    path: 'edit/:id',
    component: WorkingDayEditComponent,
    canDeactivate: [ComponentGuard],
    data: {breadcrumb: 'Редактирование'}
  }
];
