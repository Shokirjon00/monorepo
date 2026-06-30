import { Routes } from '@angular/router';
import {AuthenticatedUserGuard} from '@core/guards/authenticated-user.guard';
import {AnonymousUserGuard} from '@core/guards/anonymous-user.guard';

export const APP_ROUTES: Routes = [
  {
    path: '',
    canActivate: [AuthenticatedUserGuard],
    loadChildren: (): Promise<any> => import('./modules/main/main.routing').then(m => m.MAIN_ROUTES)
  },
  {
    path: 'auth',
    canActivate: [AnonymousUserGuard],
    loadChildren: (): Promise<any> => import('./modules/auth/auth.routing').then(m => m.AUTH_ROUTES)
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full'
  }
];
