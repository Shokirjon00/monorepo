import { Routes } from '@angular/router';
import { WithdrawalAmountInfoComponent } from '@modules/withdrawal-amount/withdrawal-amount-info/withdrawal-amount-info.component';
import { InfoDetailComponent } from '@modules/withdrawal-amount/withdrawal-amount-info/info-detail/info-detail.component';
import { WithdrawalSelectedCompanyAmountComponent } from '@modules/withdrawal-amount/withdrawal-amount-info/withdrawal-selected-company-amount/withdrawal-selected-company-amount.component';

export const WITHDRAWAL_AMOUNT_INFO_ROUTING: Routes = [
  {
    path: '',
    component: WithdrawalAmountInfoComponent,
    data: {breadcrumb: {skip: true}}
  },
  {
    path: 'detail/:id',
    component: InfoDetailComponent,
    data: {
      breadcrumb : 'Просмотр'
    }
  },
  {
    path: 'withdrawal-select-company',
    component: WithdrawalSelectedCompanyAmountComponent,
    data: {
      breadcrumb : 'Выборочный вывод'
    }
  }
]
