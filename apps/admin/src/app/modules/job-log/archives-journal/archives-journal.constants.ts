import {ICaption} from "@core/interfaces/table.interface";
import {MatchMode} from "@core/enums/match-mode.enum";
import {ITab} from "@core/interfaces/header.interface";

export class JobLogArchivesConstants {
  /**
   *
   */
  static readonly ARCHIVES_JOURNAL_COLUMNS : ICaption[] = [
    {
      key: 'ID',
      field: 'id',
      type: 'text',
      filterType: 'text',
      isSelected: true,
    },
    {
      key: 'ID платежа',
      field: 'paymentId',
      type: 'text',
      filterType: 'text',
      mode: MatchMode.equalsOnly,
      isSelected: true,
    },
    {
      key: 'Статус',
      field: 'statusName',
      type: 'text',
      filterType: 'text',
      isFiltered: false,
      isSelected: true,
      width: '155px',
    },
    {
      key: 'Тип задачи',
      field: 'jobLogTypeName',
      type: 'text',
      filterType: 'text',
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
      key: 'Изменил',
      field: 'modifiedByName',
      type: 'text',
      filterType: 'text',
      isSelected: true,
    },
    {
      key: 'Дата завершения',
      field: 'finishedDateTime',
      type: 'datetime',
      filterType: 'date',
      isSelected: true,
    }
  ];
  /**
   *
   */
  static readonly HEADER_TABS: ITab[] = [
    {
      label: 'Основной журнал',
      path: '/job-log/main-journal',
      permissionName:'JobLogList'
    },
    {
      label: 'Журнал архивов',
      path: '/job-log/archives-journal',
      permissionName:'JobLogDWHList'
    }
  ]
}

