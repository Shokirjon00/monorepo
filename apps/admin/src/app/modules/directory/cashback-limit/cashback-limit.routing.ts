import {Routes} from '@angular/router';
import {CashbackLimitComponent} from '@modules/directory/cashback-limit/cashback-limit.component';
import {CashbackLimitEditComponent} from '@modules/directory/cashback-limit/cashback-limit-detail/cashback-limit-edit/cashback-limit-edit.component';
import {CashbackLimitInfoComponent} from '@modules/directory/cashback-limit/cashback-limit-detail/cashback-limit-info/cashback-limit-info.component';
import {ComponentGuard} from '@core/guards/component.guard';

export const CASHBACK_LIMIT_ROUTING: Routes = [
  {
    path: '',
    component: CashbackLimitComponent,
    data: {breadcrumb: 'Условия кэшбэка'}
  },
  {
    path: 'new',
    component: CashbackLimitEditComponent,
    data: {breadcrumb: 'Добавление'}
  },
  {
    path: 'edit/:id',
    component: CashbackLimitEditComponent,
    canDeactivate: [ComponentGuard],
    data: {breadcrumb: 'Редактирование'}
  },
  {
    path: 'info/:id',
    component: CashbackLimitInfoComponent,
    data: {breadcrumb: 'Информация'}
  },
];
