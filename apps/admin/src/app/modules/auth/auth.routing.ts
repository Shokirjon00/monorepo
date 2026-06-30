import { Routes } from '@angular/router';

export const AUTH_ROUTES: Routes = [
  {
    path: '',
    loadComponent:(): any => import('./auth.component').then(m => m.AuthComponent),
    children: [
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
      },
      {
        path: 'login',
        loadComponent:(): any => import('./login/login.component').then(m => m.LoginComponent),
      },
      {
        path: 'first-password',
        loadComponent:(): any => import('./first-entry/first-entry.component').then(m => m.FirstEntryComponent),
      },
      {
        path: 'new-password',
        loadComponent:(): any => import('./change-password/change-password.component').then(m => m.ChangePasswordComponent),
      },
    ]
  }
];
