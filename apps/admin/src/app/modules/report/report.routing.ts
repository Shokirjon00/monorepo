import { Routes } from '@angular/router';
import { ngxPermissionsGuard } from "ngx-permissions";

export const REPORT_ROUTING: Routes = [
  {
    path: '',
    loadComponent: (): any => import('./report.component').then(c => c.ReportComponent),
    children: [
      {
        path: '',
        redirectTo: 'export-queue',
        pathMatch: 'full'
      },
      {
        path: 'export-queue',
        loadComponent: (): any => import('./export-queue/export-queue.component').then(m => m.ExportQueueComponent),
        canActivate: [ngxPermissionsGuard],
        data: {
          breadcrumb: 'Очередь эксортов',
          permissions: {
            only: 'AdminReportQueueList',
            redirectTo: '/access-denied'
          }
        },
      },
      {
        path: 'generating-reports',
        loadComponent: (): any => import('./generating-reports/generating-reports.component').then(m => m.GeneratingReportsComponent),
        canActivate: [ngxPermissionsGuard],
        data: {
          breadcrumb: 'Формирование отчетов',
          permissions: {
            only: 'AdminReportGenerate',
            redirectTo: '/access-denied'
          }
        },
      }
    ]
  }
];

