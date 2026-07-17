import {Routes} from '@angular/router';

export const MOBILE_APP_ROUTING: Routes = [
  {
    path: '',
    loadComponent: (): any => import('./mobile-app.component').then(c => c.MobileAppComponent),
  }
];
