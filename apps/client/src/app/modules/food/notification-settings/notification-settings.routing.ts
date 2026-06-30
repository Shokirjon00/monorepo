import { Routes } from "@angular/router";

export const NOTIFICATION_SETTINGS_ROUTING: Routes = [
  {
    path: '',
    loadComponent: () => import('./notification-settings.component').then(m => m.NotificationSettingsComponent)
  }
]
