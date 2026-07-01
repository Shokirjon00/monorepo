import {Routes} from "@angular/router";
import {
  WithdrawalAmountSettingComponent
} from "@modules/withdrawal-amount/withdrawal-amount-setting/withdrawal-amount-setting.component";
import {ComponentGuard} from '@eskhata/util';

export const WITHDRAWAL_AMOUNT_SETTING_ROUTER: Routes = [
  {
    path: '',
    component: WithdrawalAmountSettingComponent,
    canDeactivate: [ComponentGuard],
    data: {breadcrumb : "Настройки вывода средств"}
  }
]
