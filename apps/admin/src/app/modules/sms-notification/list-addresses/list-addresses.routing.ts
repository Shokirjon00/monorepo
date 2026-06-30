import { Routes } from '@angular/router';

export const LIST_ADDRESSES: Routes = [
  {
    path: '',
    loadComponent: (): any => import('./list-addresses.component').then(m => m.ListAddressesComponent)
  }
]
