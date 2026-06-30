import {Routes} from '@angular/router';
import {ClientRoleComponent} from '@modules/directory/client-role/client-role.component';
import {ClientRoleEditComponent} from '@modules/directory/client-role/client-role-detail/client-role-edit/client-role-edit.component';
import {ClientRoleInfoComponent} from '@modules/directory/client-role/client-role-detail/client-role-info/client-role-info.component';
import {ComponentGuard} from '@core/guards/component.guard';

export const CLIENT_ROLES_ROUTING: Routes = [
  {
    path: '',
    component: ClientRoleComponent,
    data: {breadcrumb: 'Роль клиента'}
  },
  {
    path: 'new',
    component: ClientRoleEditComponent,
    data: {breadcrumb: 'Добавление'}
  },
  {
    path: 'edit/:id',
    component: ClientRoleEditComponent,
    canDeactivate: [ComponentGuard],
    data: {breadcrumb: 'Редактирование'}
  },
  {
    path: 'info/:id',
    component: ClientRoleInfoComponent,
    data: {breadcrumb: 'Информация'}
  },
];
