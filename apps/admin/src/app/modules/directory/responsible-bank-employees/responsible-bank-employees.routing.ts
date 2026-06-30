import {Routes} from '@angular/router';
import {
  ResponsibleBankEmployeesComponent
} from '@modules/directory/responsible-bank-employees/responsible-bank-employees.component';
import {
  ResponsibleBankEmployeesEditComponent
} from '@modules/directory/responsible-bank-employees/responsible-bank-employees-detail/responsible-bank-employees-edit/responsible-bank-employees-edit.component';
import {
  ResponsibleBankEmployeesInfoComponent
} from '@modules/directory/responsible-bank-employees/responsible-bank-employees-detail/responsible-bank-employees-info/responsible-bank-employees-info.component';
import {ComponentGuard} from '@core/guards/component.guard';

export const RES_BANK_EMP_ROUTING: Routes = [
  {
    path: '',
    component: ResponsibleBankEmployeesComponent,
    data: {breadcrumb: 'Ответственный сотрудник'}
  },
  {
    path: 'new',
    component: ResponsibleBankEmployeesEditComponent,
    data: {breadcrumb: 'Добавление'}
  },
  {
    path: 'edit/:id',
    component: ResponsibleBankEmployeesEditComponent,
    canDeactivate: [ComponentGuard],
    data: {breadcrumb: 'Редактирование'}
  },
  {
    path: 'info/:id',
    component: ResponsibleBankEmployeesInfoComponent,
    data: {breadcrumb: 'Информация'}
  },
];
