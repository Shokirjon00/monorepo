import {Routes} from '@angular/router';
import {CommissionComponent} from '@modules/directory/commission/commission.component';
import {CommissionEditComponent} from '@modules/directory/commission/commission-detail/commission-edit/commission-edit.component';
import {CommissionDetailComponent} from '@modules/directory/commission/commission-detail/commission-detail.component';
import {CommissionInfoComponent} from '@modules/directory/commission/commission-detail/commission-info/commission-info.component';
import {ComponentGuard} from '@eskhata/util';

export const COMMISSION_ROUTES: Routes = [
  {
    path: '',
    component: CommissionComponent,
    data: {
      animation: true,
      breadcrumb: 'Комиссия'
    }
  },
  {
    path: 'new',
    component: CommissionEditComponent,
    data: {breadcrumb: 'Добавление'}
  },
  {
    path: 'detail',
    component: CommissionDetailComponent,
    data: {breadcrumb: {skip: true}},
    children: [
      {
        path: 'info/:id',
        component: CommissionInfoComponent,
        data: {breadcrumb: 'Информация'}
      },
      {
        path: 'edit/:id',
        component: CommissionEditComponent,
        canDeactivate: [ComponentGuard],
        data: {breadcrumb: 'Редактирование'}
      },
    ]
  },
];
