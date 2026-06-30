import { Routes } from '@angular/router';
import { ComponentGuard } from "@core/guards/component.guard";
import { NgxPermissionsGuard } from "ngx-permissions";

export const MERCHANT: Routes = [
  {
    path: '',
    loadComponent: (): any => import('./merchant.component').then(c => c.MerchantComponent),
  },
  {
    path: 'create-application',
    loadComponent: (): any => import('./merchant-detail/merchant-application-add/merchant-application-add.component').then(c => c.MerchantApplicationAddComponent),
    canActivate: [NgxPermissionsGuard],
    data: {
      breadcrumb: 'Заявка на добавление точки',
      permissions: {
        only: 'MerchantApplicationCreate',
        redirectTo: '/access-denied',
      },
    },
  },
  {
    path: 'new',
    loadComponent: (): any => import('./merchant-detail/merchant-edit/merchant-edit.component').then(c => c.MerchantEditComponent),
    canActivate: [NgxPermissionsGuard],
    data: {
      breadcrumb: "Добавление",
      permissions: {
        only: 'MerchantCreate',
        redirectTo: '/access-denied'
      }
    },
  },
  {
    path: ':merchantId',
    data: {breadcrumb: {alias: 'merchantDetail'}},
    loadComponent: (): any => import('./merchant-detail/merchant-detail.component').then(c => c.MerchantDetailComponent),
    children: [
      {
        path: '',
        redirectTo: 'poses',
        pathMatch: 'full'
      },
      {
        path: 'poses',
        canActivate: [NgxPermissionsGuard],
        loadChildren: (): any => import('../pos/pos.routing').then(m => m.POS_ROUTES),
        data: {
          breadcrumb: {skip: true},
          permissions: {
            only: 'PosList',
            redirectTo: '/access-denied'
          }
        },
      },
      {
        path: 'info',
        loadComponent: (): any => import('./merchant-detail/merchant-info/merchant-info.component').then(c => c.MerchantInfoComponent),
        canActivate: [NgxPermissionsGuard],
        data: {
          breadcrumb: "Информация",
          permissions: {
            only: 'MerchantDetail',
            redirectTo: '/access-denied'
          }
        }
      },
      {
        path: 'edit',
        canDeactivate: [ComponentGuard],
        canActivate: [NgxPermissionsGuard],
        loadComponent: (): any => import('./merchant-detail/merchant-edit/merchant-edit.component').then(c => c.MerchantEditComponent),
        data: {
          breadcrumb: {skip: true},
          permissions: {
            only: 'MerchantUpdate',
            redirectTo: '/access-denied'
          }
        },
      },
      {
        path: 'integration',
        canActivate: [NgxPermissionsGuard],
        loadComponent: (): any => import('./merchant-detail/integration-setting/integration-setting.component').then(c => c.IntegrationSettingComponent),
        data: {
          breadcrumb: "Настройки интеграции",
          permissions: {
            only: 'MerchantIntegrationConfiguration',
            redirectTo: '/access-denied'
          }
        }
      }
    ]
  },
  {
    path: 'work-day/:id',
    loadComponent: (): any => import('./merchant-detail/working-day-edit/working-day-edit.component').then(c => c.WorkingDayEditComponent),
    data: {
      breadcrumb: "Рабочие дни",
      permissions: {
        only: 'MerchantWorkDayUpdate',
        redirectTo: '/access-denied'
      }
    }
  }
]
