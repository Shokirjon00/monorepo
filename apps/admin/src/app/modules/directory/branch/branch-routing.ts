import { Routes } from '@angular/router';
import { BranchComponent } from '@modules/directory/branch/branch.component';
import { BranchEditComponent } from '@modules/directory/branch/branch-detail/branch-edit/branch-edit.component';
import { BranchInfoComponent } from '@modules/directory/branch/branch-detail/branch-info/branch-info.component';
import { ComponentGuard } from '@core/guards/component.guard';
import { NgxPermissionsGuard } from 'ngx-permissions';

export const BRANCH_ROUTES: Routes = [
  {
    path: '',
    component: BranchComponent,
    data: {breadcrumb: 'Филиал'}
  },
  {
    path: 'new',
    component: BranchEditComponent,
    canActivate: [NgxPermissionsGuard],
    data: {
      breadcrumb: 'Добавление',
      permissions: {
        only: 'BranchCreate',
        redirectTo: '/access-denied'
      }
    }
  },
  {
    path: 'edit/:id',
    component: BranchEditComponent,
    canDeactivate: [ComponentGuard],
    canActivate: [NgxPermissionsGuard],
    data: {
      breadcrumb: 'Редактирование',
      permissions: {
        only: 'BranchUpdate',
        redirectTo: '/access-denied'
      }
    }
  },
  {
    path: 'info/:id',
    component: BranchInfoComponent,
    canActivate: [NgxPermissionsGuard],
    data: {
      breadcrumb: 'Информация',
      permissions: {
        only: 'BranchDetail',
        redirectTo: '/access-denied'
      }
    }
  },
];
