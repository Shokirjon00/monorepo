import { Routes } from '@angular/router';

export const APP_ROUTES: Routes = [
  {
    path: 'auth',
    loadComponent: () => import('./pages/auth/auth.component').then(m => m.AuthComponent),
    loadChildren: () => import('./pages/auth/auth.routing').then(m => m.AUTH_ROUTES)
  },
  { path: '', redirectTo: 'auth', pathMatch: 'full' }
];
