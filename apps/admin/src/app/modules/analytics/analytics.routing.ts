import { Routes } from "@angular/router";
import { AnalyticsContainerComponent } from "@modules/analytics/analytics-container/analytics-container.component";
import { AnalyticsComponent } from "@modules/analytics/analytics.component";
import { QrPosAnalyticsComponent } from "@modules/analytics/qr-pos-analytics/qr-pos-analytics.component";

export const ANALYTICS_ROUTES: Routes = [
  {
    path: '',
    component: AnalyticsContainerComponent,
    children: [
      { path: '', redirectTo: 'overview', pathMatch: 'full' },
      {
        path: 'overview',
        component: AnalyticsComponent,
        data: { breadcrumb: 'Аналитика' },
      },
      {
        path: 'qr-pos',
        component: QrPosAnalyticsComponent,
        data: { breadcrumb: 'QR/POS Аналитика' },
      },
    ],
  },
];
