import { Routes } from '@angular/router';
import { BankComponent } from '@modules/directory/bank/bank.component';
import { BankEditComponent } from '@modules/directory/bank/bank-detail/bank-edit/bank-edit.component';
import { BankInfoComponent } from '@modules/directory/bank/bank-detail/bank-info/bank-info.component';
import { ComponentGuard } from '@eskhata/util';

export const BANK_ROUTES: Routes = [
  {
    path: '',
    component: BankComponent,
    data: {
      breadcrumb: 'Банк'
    }
  },
  {
    path: 'new',
    component: BankEditComponent,
    data: {
      breadcrumb: 'Добавление'
    }
  },
  {
    path: 'edit/:id',
    component: BankEditComponent,
    canDeactivate: [ComponentGuard],
    data: {
      breadcrumb: 'Редактирование'
    }
  },
  {
    path: 'integration-edit/:id',
    loadComponent: (): any => import('./bank-setup-edit/bank-setup-edit.component').then(c => c.BankSetupEditComponent),
    data: {
      breadcrumb: 'Настройки банка',
    }
  },
  {
    path: 'info/:id',
    component: BankInfoComponent,
    data: {
      breadcrumb: 'Информация'
    }
  }
];
