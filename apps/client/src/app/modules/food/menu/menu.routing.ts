import { Routes } from '@angular/router';
import { NgxPermissionsGuard } from "ngx-permissions";

export const MENU_ROUTING: Routes = [
  {
    path: '',
    loadComponent: () => import('./menu.component').then(m => m.MenuComponent),
    children: [
      {
        path: '',
        redirectTo: 'products',
        pathMatch: "full"
      },
      {
        path: 'products',
        loadComponent: () => import('./products/products.component').then(m => m.ProductsComponent),
      },
      {
        path: 'add',
        pathMatch: 'full',
        loadComponent: () => import('./menu-edit/menu-edit.component').then(m => m.MenuEditComponent),
        canActivate: [NgxPermissionsGuard],
        data: {
          breadcrumb: "Добавление",
          permissions: {
            only: 'FoodVendorMenuApplicationCreate',
            redirectTo: '/access-denied'
          },
          mode: 'create'
        }
      },
      {
        path: 'add/:id',
        loadComponent: () => import('./menu-edit/menu-edit.component').then(m => m.MenuEditComponent),
        canActivate: [NgxPermissionsGuard],
        data: {
          breadcrumb: "Редактирование существующего продукта",
          permissions: {
            only: 'FoodVendorMenuApplicationModify',
            redirectTo: '/access-denied'
          },
          mode: 'modify'
        }
      },
      {
        path: 'edit/:id',
        loadComponent: () => import('./menu-edit/menu-edit.component').then(m => m.MenuEditComponent),
        canActivate: [NgxPermissionsGuard],
        data: {
          breadcrumb: "Редактирование",
          permissions: {
            only: 'FoodVendorMenuApplicationUpdate',
            redirectTo: '/access-denied'
          },
          mode: 'update'
        }
      },
      {
        path: ':type',
        loadComponent: () => import('./product-applications/product-applications.component').then(m => m.ProductApplicationsComponent),
        data: {
          allowedTypes: ['in-review', 'rejected'],
          breadcrumb: 'Меню'
        }
      }
    ]
  },

];

