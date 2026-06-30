import {Routes} from "@angular/router";
import {NgxPermissionsGuard} from "ngx-permissions";

export const REGISTRATION_DETAIL_ROUTING: Routes = [
  {
    path: '',
    loadComponent: (): any => import('./retail-outlet-detail.component').then(c => c.RetailOutletDetailComponent),
    data: {
      breadcrumb: 'Детальный просмотр'
    },
    children: [
      {
        path: '',
        redirectTo: 'retail-outlet-info',
        pathMatch: 'full'
      },
      {
        path: 'retail-outlet-info',
        loadComponent: (): any => import('./retail-outlet-info/retail-outlet-info.component').then(c => c.RetailOutletInfoComponent),
        canActivate: [NgxPermissionsGuard],
        data: {
          breadcrumb: {skip: true},
          permissions: {
            only: '',
            redirectTo: '/retail-outlet',
            pathMatch: 'full'
          }
        }
      },
      {
        path: 'retail-outlet-dialog',
        loadComponent: (): any => import('./retail-outlet-dialog/retail-outlet-dialog.component').then(c => c.RetailOutletDialogComponent),
        canActivate: [NgxPermissionsGuard],
        data: {
          breadcrumb: {skip: true},
          permissions: {
            redirectTo: '/retail-outlet',
            pathMatch: 'full'
          }
        }
      },
      {
        path: 'retail-outlet-history',
        loadComponent: (): any => import('./retail-outlet-histories/retail-outlet-histories.component').then(c => c.RetailOutletHistoriesComponent),
        canActivate: [NgxPermissionsGuard],
        data: {
          breadcrumb: {skip: true},
          permissions: {
            only: '',
            redirectTo: '/retail-outlet',
            pathMatch: 'full'
          }
        }
      },
    ]
  },
]
