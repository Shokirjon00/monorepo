import { Routes } from "@angular/router";

export const DELIVERY_METHODS_ROUTING: Routes = [
  {
    path: '',
    loadComponent: () => import('./delivery-methods.component').then(m => m.DeliveryMethodsComponent)
  }
]
