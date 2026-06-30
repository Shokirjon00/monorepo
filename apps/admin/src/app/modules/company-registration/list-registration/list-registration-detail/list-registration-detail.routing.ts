import {Routes} from "@angular/router";
import {NgxPermissionsGuard} from "ngx-permissions";
import {ListRegistrationDetailComponent} from "@modules/company-registration/list-registration/list-registration-detail/list-registration-detail.component";
import {ListRegistrationInfoComponent} from "@modules/company-registration/list-registration/list-registration-detail/list-registration-info/list-registration-info.component";
import {ListRegistrationEditComponent} from "@modules/company-registration/list-registration/list-registration-detail/list-registration-edit/list-registration-edit.component";
import {ListRegistrationHistoriesComponent} from "@modules/company-registration/list-registration/list-registration-detail/list-registration-histories/list-registration-histories.component";

export const REGISTRATION_DETAIL_ROUTING: Routes = [
  {
    path: '',
    component: ListRegistrationDetailComponent,
    data: {
      breadcrumb: 'Детальный просмотр'
    },
    children: [
      {
        path: '',
        redirectTo: 'list-info',
        pathMatch: 'full'
      },
      {
        path: 'list-info',
        component: ListRegistrationInfoComponent,
        canActivate: [NgxPermissionsGuard],
        data: {
          breadcrumb: {skip: true},
          permissions: {
            only: 'CompanyRegistrationApplicationDetail',
            redirectTo: '/list-registration',
            pathMatch: 'full'
          }
        }
      },
      {
        path: 'list-registration-edit',
        component: ListRegistrationEditComponent,
        canActivate: [NgxPermissionsGuard],
        data: {
          breadcrumb: {skip: true},
          permissions: {
            redirectTo: '/list-registration',
            pathMatch: 'full'
          }
        }
      },
      {
        path: 'list-history',
        component: ListRegistrationHistoriesComponent,
        canActivate: [NgxPermissionsGuard],
        data: {
          breadcrumb: {skip: true},
          permissions: {
            only: 'CompanyRegistrationApplicationHistoryDictionary',
            redirectTo: '/list-registration',
            pathMatch: 'full'
          }
        }
      },
    ]
  },
]
