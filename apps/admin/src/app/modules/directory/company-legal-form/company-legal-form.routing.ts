import {Routes} from '@angular/router';
import {ComponentGuard} from '@core/guards/component.guard';
import {CompanyLegalFormComponent} from '@modules/directory/company-legal-form/company-legal-form.component';
import {
  CompanyLegalFormEditComponent
} from '@modules/directory/company-legal-form/company-legal-form-detail/company-legal-form-edit/company-legal-form-edit.component';
import {
  CompanyLegalFormInfoComponent
} from '@modules/directory/company-legal-form/company-legal-form-detail/company-legal-form-info/company-legal-form-info.component';

export const LEGAL_FORM_ROUTING: Routes = [
  {
    path: '',
    component: CompanyLegalFormComponent,
    data: {breadcrumb: 'Форма собственности'}
  },
  {
    path: 'new',
    component: CompanyLegalFormEditComponent,
    data: {breadcrumb: 'Добавление'}
  },
  {
    path: 'edit/:legalFormId',
    component: CompanyLegalFormEditComponent,
    canDeactivate: [ComponentGuard],
    data: {breadcrumb: 'Редактирование'}
  },
  {
    path: 'info/:legalFormId',
    component: CompanyLegalFormInfoComponent,
    data: {breadcrumb: 'Информация'}
  },
];
