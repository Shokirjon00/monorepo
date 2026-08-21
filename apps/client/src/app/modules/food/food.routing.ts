import { ngxPermissionsGuard } from "ngx-permissions";
import { Routes } from "@angular/router";

export const FOOD: Routes = [
  {
    path: '',
    loadComponent: () => import('./food.component').then(c => c.FoodComponent),
    children: [
      {
        path: '',
        redirectTo: 'analytics-food',
        pathMatch: 'full',
      },
      {
        path: 'analytics-food',
        loadComponent: () => import('./analytics-food/analytics-food.component').then(c => c.AnalyticsFoodComponent),
        canActivate: [ngxPermissionsGuard],
        data: {
          breadcrumb: { skip: true },
          permissions: {
            only: ['FoodVendorStatisticsList', 'FoodVendorStatisticsRevenue', 'FoodVendorStatisticsClientAnalytics'],
            redirectTo: '/food/orders',
          },
        },
      },
      {
        path: 'order-reviews',
        loadComponent: () =>
          import('./order-reviews/order-reviews.component').then(c => c.OrderReviewsComponent),
        canActivate: [ngxPermissionsGuard],
        data: {
          breadcrumb: { skip: true },
          permissions: {
            only: ['FoodVendorStatisticsList', 'FoodVendorStatisticsRevenue', 'FoodVendorStatisticsClientAnalytics'],
            redirectTo: '/food/orders',
          },
        },
      },
      {
        path: 'orders',
        loadChildren: () => import('./orders/orders.routing').then(m => m.ORDERS),
        canActivate: [ngxPermissionsGuard],
        data: {
          breadcrumb: 'Заказы',
          permissions: {
            only: 'FoodVendorOrderList',
            redirectTo: '/food/food-menu',
          },
        },
      },
      {
        path: 'food-menu',
        loadChildren: () => import('./menu/menu.routing').then(m => m.MENU_ROUTING),
        canActivate: [ngxPermissionsGuard],
        data: {
          breadcrumb: 'Меню',
          permissions: {
            only: 'FoodVendorMenuList',
            redirectTo: '/food/delivery',
          },
        },
      },
      {
        path: 'delivery',
        loadChildren: () => import('./delivery-methods/delivery-methods.routing').then(m => m.DELIVERY_METHODS_ROUTING),
        canActivate: [ngxPermissionsGuard],
        data: {
          breadcrumb: { skip: true },
          permissions: {
            only: 'FoodVendorDeliveryTypeList',
            redirectTo: '/access-denied',
          },
        },
      },
      {
        path: 'notification-settings',
        loadChildren: () =>
          import('./notification-settings/notification-settings.routing').then(m => m.NOTIFICATION_SETTINGS_ROUTING),
        canActivate: [ngxPermissionsGuard],
        data: {
          breadcrumb: { skip: true },
          permissions: {
            only: 'FoodVendorNotificationSettingsViaTelegramStatus',
            redirectTo: '/access-denied',
          },
        },
      },
    ],
  },
];
