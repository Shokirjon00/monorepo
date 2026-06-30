import { Routes } from "@angular/router";
import { ComponentGuard } from "@core/guards/component.guard";
import { NgxPermissionsGuard } from "ngx-permissions";
import { JobLogTypesComponent } from "@modules/directory/job-log-types/job-log-types.component";
import { JobLogTypesEditComponent } from "@modules/directory/job-log-types/job-log-types-detail/job-log-types-edit/job-log-types-edit.component";

export const JobLogTypesRouting: Routes = [
  {
    path: '',
    component: JobLogTypesComponent,
    data: {breadcrumb: 'Тип задачи'}
  },
  {
    path: 'edit/:id',
    component: JobLogTypesEditComponent,
    canDeactivate: [ComponentGuard],
    canActivate: [NgxPermissionsGuard],
    data: {
      breadcrumb: 'Редактирование',
      permissions: {
        only: 'JobLogTypeUpdate',
        redirectTo: '/access-denied'
      }
    }
  },
];
