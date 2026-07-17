import { Routes } from '@angular/router';

export const SETTING_ROUTES: Routes = [
  {
    path: '',
    loadComponent: (): any => import('./sms-notification.component').then(c => c.SmsNotificationComponent),
    children: [
      {
        path: '',
        redirectTo: 'list',
        pathMatch: 'full'
      },
      {
        path: 'list',
        loadChildren: (): any => import('./promotion-system/promotion-system.routing').then(m => m.SMS_NOTIFICATION),
        data: {
          permissions: {
            only: 'SystemNotificationsList'
          }
        },
      },
      {
        path: 'custom-notifications',
        loadChildren: (): any => import('./users/users.routing').then(m => m.CUSTOM_NOTIFICATIONS),
        data: {
          breadcrumb: 'Пользовательские'
        },
      },
      {
        path: 'list-addresses',
        loadChildren: (): any => import('./list-addresses/list-addresses.routing').then(m => m.LIST_ADDRESSES),
        data: {
          breadcrumb: 'Пользовательские'
        },
      }
    ]
  },
];

