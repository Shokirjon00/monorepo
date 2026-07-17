import {Routes} from '@angular/router';
import {PosInfoComponent} from './pos-info/pos-info.component';
import {PosEditComponent} from '../pos-edit/pos-edit.component';
import {ComponentGuard} from '@eskhata/util';
import {PosDetailComponent} from '@modules/client/pos/pos-detail/pos-detail.component';

export const POS_CONTAINER_ROUTES: Routes = [
  {
    path: '',
    component: PosDetailComponent,
    data: {breadcrumb: {skip: true}},
    children: [
      {
        path: 'info',
        component: PosInfoComponent,
        data: {
          breadcrumb: 'Информация'
        }
      },
      {
        path: 'edit',
        component: PosEditComponent,
        canDeactivate: [ComponentGuard],
        data: {
          breadcrumb: 'Редактирование '
        }
      },
    ]
  }
]
