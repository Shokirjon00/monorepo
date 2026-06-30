import {Routes} from "@angular/router";

export const REGISTRATION_ROUTING: Routes = [
  {
    path: '',
    loadComponent: (): any => import('./company-registration.component').then(c => c.CompanyRegistrationComponent),
    children: [
      {
        path: '',
        redirectTo: 'list-registration',
        pathMatch: 'full'
      },
      {
        path: 'list-registration',
        loadChildren: (): any => import('./list-registration/list-registration.routing').then(m => m.LIST_REGISTRATION),
        data: {
          permissions: {
            only: 'CompanyRegistrationApplicationStatusDictionary'
          }
        },
      },
      {
        path: 'retail-outlet',
        loadChildren: (): any => import('./retail-outlet/retail-outlet.routing').then(m => m.RETAIL_OUTING),
        data: {
          permissions: {
            only: ''
          }
        },
      },
    ],
  },
];
