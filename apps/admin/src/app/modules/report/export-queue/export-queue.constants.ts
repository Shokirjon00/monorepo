import { ICaption } from '@eskhata/util';
import { ITab } from '@eskhata/util';
import { IAction } from '@eskhata/util';
import { ActionEnum } from '@eskhata/util';

export class ExportQueueConstants {
  static readonly EXPORT_QUEUE_COLUMNS: ICaption[] = [
    {
      key: 'Название файла',
      field: 'fileName',
      type: 'text',
      filterType: 'text',
      isSelected: true,
    },
    {
      key: 'Тип экспорта',
      field: 'adminReportName',
      type: 'text',
      filterType: 'text',
      isSelected: true,
    },
    {
      key: 'Статус',
      field: 'statusName',
      type: 'text',
      filterType: 'text',
      isSelected: true,
    },
    {
      key: 'Ссылка',
      field: 'fileId',
      type: 'download',
      isSortable: true,
      isFiltered: true,
      isSelected: true,
    },
    {
      key: 'Создано',
      field: 'createdAt',
      type: 'date',
      filterType: 'date',
      isSelected: true,
    },
    {
      key: 'Создал',
      field: 'createdByName',
      type: 'text',
      filterType: 'text',
      isSelected: true,
    },
    {
      key: 'Изменено',
      field: 'modifiedAt',
      type: 'date',
      filterType: 'date',
      isSelected: true,
    },
    {
      key: 'Описание ошибки',
      field: 'errorMessage',
      type: 'text',
      filterType: 'text',
      isSelected: true,
    },
  ];

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

