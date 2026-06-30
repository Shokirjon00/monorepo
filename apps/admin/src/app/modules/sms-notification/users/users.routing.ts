import { Routes } from '@angular/router';

export const CUSTOM_NOTIFICATIONS: Routes = [
  {
    path: '',
    loadComponent: (): any => import('./users.component').then(m => m.UsersComponent)
  }
]
