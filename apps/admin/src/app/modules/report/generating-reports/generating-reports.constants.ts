import { ITab } from '@eskhata/util';

export class GeneratingReportsConstants {

  static readonly HEADER_TABS: ITab[] = [
    {
      label: 'Очередь отчетов',
      path: '/report/export-queue',
      permissionName: 'AdminReportQueueList'
    },
    {
      label: 'Формирование отчетов',
      path: '/report/generating-reports',
      permissionName: 'AdminReportGenerate'
    }
  ]
}

