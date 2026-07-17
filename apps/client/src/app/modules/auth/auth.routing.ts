import { Routes } from '@angular/router';
import { AuthComponent } from "@modules/auth/auth.component";
import { LoginComponent } from "@modules/auth/login/login.component";
import { FirstEntryComponent } from "@modules/auth/first-entry/first-entry.component";
import { ChangePasswordComponent } from "@modules/auth/change-password/change-password.component";

export const AUTH_ROUTES: Routes = [
  {
    path: '',
    component: AuthComponent,
    children: [
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
      },
      {
        path: 'login',
        component: LoginComponent
      },
      {
        path: 'first-password',
        component: FirstEntryComponent
      },
      {
        path: 'new-password',
        component: ChangePasswordComponent
      },
      {
        path: 'reset-password',
        loadComponent: (): any => import('./reset/reset.component').then(c => c.ResetComponent)
      },
    ]
  }
];
