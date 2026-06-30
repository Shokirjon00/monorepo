import {Routes} from '@angular/router';
import {WithdrawalAmountSettingComponent} from './withdrawal-amount-setting.component';
import {
  WithdrawalAmountSettingEditComponent
} from './withdrawal-amount-setting-edit/withdrawal-amount-setting-edit.component';
import {
  WithdrawalAmountSettingDetailComponent
} from '@modules/withdrawal-amount/withdrawal-amount-setting/withdrawal-amount-setting-detail/withdrawal-amount-setting-detail.component';
import {ComponentGuard} from '@core/guards/component.guard';

export const WITHDRAWAL_AMOUNT_SETTING_ROUTER: Routes = [
  {
    path: '',
    component: WithdrawalAmountSettingComponent,
    data: {
      breadcrumb: 'Настройки вывода'
    }
  },
  {
    path: 'new',
    component: WithdrawalAmountSettingEditComponent,
    data: {
      breadcrumb: 'Добавление настройки'
    }
  },
  {
    path: 'edit/:id',
    component: WithdrawalAmountSettingEditComponent,
    canDeactivate: [ComponentGuard],
    data: {
      breadcrumb: 'Изменение настройки'
    }
  },
  {
    path: 'info/:id',
    component: WithdrawalAmountSettingDetailComponent,
    data: {
      breadcrumb: 'Информация'
    }
  }
];
