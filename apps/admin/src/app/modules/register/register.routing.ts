import { Routes } from '@angular/router';

export const REGISTER_ROUTING: Routes = [
  {
    path: '',
    loadComponent: (): any => import('./register.component').then(c => c.RegisterComponent),
    data: {breadcrumb: 'Реестры'},
    children: [
      {
        path: '',
        redirectTo: 'merchant-balance',
        pathMatch: 'full',
      },
      {
        path: 'merchant-balance',
        loadComponent: (): any => import('./merchant-balance/merchant-balance.component').then(c => c.MerchantBalanceComponent)
      },
      {
        path: 'single-qr',
        loadComponent: (): any => import('./single-qr/single-qr.component').then(c => c.SingleQrComponent),
        data: {
          permissions: {
            only: 'RegistryOfSingleQRIFTPaymentsList',
            redirectTo: '/access-denied'
          }
        }
      },
      {
        path: 'registry-abs-sync',
        loadComponent: (): any => import('./registry-abs-sync/registry-abs-sync.component').then(c => c.RegistryAbsSyncComponent),
        data: {
          permissions: {
            only: 'RegistryAbsSyncList',
            redirectTo: 'access-denied'
          }
        }
      },
    ]
  }
]
