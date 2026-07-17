import {Routes} from '@angular/router';
import {ComponentGuard} from '@eskhata/util';

export const USER_ROLES_ROUTING: Routes = [
  {
    path: '',
    loadComponent: (): any => import('./user-role.component').then(c => c.UserRoleComponent),
    data: {breadcrumb: 'Роль пользователя'}
  },
  {
    path: 'new',
    loadComponent: (): any => import('./user-role-detail/user-role-edit/user-role-edit.component').then(c => c.UserRoleEditComponent),
    data: {breadcrumb: 'Добавление'}
  },
  {
    path: 'edit/:id',
    loadComponent: (): any => import('./user-role-detail/user-role-edit/user-role-edit.component').then(c => c.UserRoleEditComponent),
    canDeactivate: [ComponentGuard],
    data: {breadcrumb: 'Редактирование'}
  },
  {
    path: 'info/:id',
    loadComponent: (): any => import('./user-role-detail/user-role-info/user-role-info.component').then(c => c.UserRoleInfoComponent),
    data: {breadcrumb: 'Информация'}
  },
];
