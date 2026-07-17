import { Routes } from '@angular/router';

export const SMS_NOTIFICATION: Routes = [
  {
    path: '',
    loadComponent: (): any => import ('./promotion-system.component').then(c => c.PromotionSystemComponent),
    data: {breadcrumb: {skip: true}},
  },
  {
    path: 'edit/:id',
    loadComponent: (): any => import ('./promotion-system-edit/promotion-system-edit.component').then(c => c.PromotionSystemEditComponent),
    data: {
      breadcrumb: 'Редактирование',
      permissions: {
        only: 'SystemNotificationsDetail'
      }
    }
  },
  {
    path: 'info/:id',
    loadComponent: (): any => import ('./promotion-system-info/promotion-system-info.component').then(c => c.PromotionSystemInfoComponent),
    data: {
      breadcrumb: 'Информация',
      permissions: {
        only: 'SystemNotificationsUpdate'
      }
    }
  }
]
