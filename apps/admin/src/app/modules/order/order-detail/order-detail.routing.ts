import { Routes } from "@angular/router";

export const orderDetailRoutes: Routes = [
  {
    path: '',
    loadComponent: (): any => import('./order-detail.component').then(c => c.OrderDetailComponent),
    children: [
      {
        path: '',
        redirectTo: 'order-detail-list',
        pathMatch: 'full',
      },
      {
        path: 'order-detail-list',
        loadComponent: (): any => import('./order-detail-list/order-detail-list.component').then(c => c.OrderDetailListComponent),
        data: {
          breadcrumb: {skip: true},
          permissions: {
            only: 'OrderHistoryList',
            redirectTo: '/order-detail-histories',
            pathMatch: 'full'
          }
        }
      },
      {
        path: 'order-detail-histories',
        loadComponent: (): any => import('./order-detail-histories/order-detail-histories.component').then(c => c.OrderDetailHistoriesComponent),
        data: {
          breadcrumb: 'Информация о заказе',
          permissions: {
            only: 'OrderDetail',
            redirectTo: '/order',
            pathMatch: 'full'
          }
        }
      }
    ]
  }
]
