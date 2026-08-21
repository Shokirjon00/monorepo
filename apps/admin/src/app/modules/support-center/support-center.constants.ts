import { ITab } from '@eskhata/util';
import { ICaption, IRowAction } from "@core/interfaces";
import { MatchMode } from "@core/enums/match-mode.enum";
import { TableRowActionEnum } from '@eskhata/util';
import { tr } from "cronstrue/dist/i18n/locales/tr";

export class SupportCenterConstants {

  static readonly HEADER_TABS: ITab[] = [
    { label: 'Все', path: '/help/all' },
    { label: 'Новое', path: '/help/new' },
    { label: 'В процессе', path: '/help/in-process' },
    { label: 'Завершен', path: '/help/completed' },
    { label: 'Отказан', path: '/help/rejected' },
    { label: 'Отменен', path: '/help/canceled' },
  ];

  static readonly SUPPORT_COLUMNS : ICaption[] = [
    {
      key: 'Статус',
      field: 'supportApplicationStatusName',
      fieldSecond: 'supportApplicationStatusName',
      type: 'indicator',
      filterType: 'text',
      isSelected: true,
      isFiltered: true,
      isSortable: true
    },
    {
      key: '№',
      field: 'number',
      type: 'number',
      filterType: 'number',
      isSelected: true,
      mode: MatchMode.equalsOnly,
      width: '200px',
    },
    {
      key: 'Тема',
      field: 'name',
      type: 'text',
      filterType: 'text',
      isSelected: true,
      width: '155px',
    },
    {
      key: 'Последнее сообщение',
      field: 'lastMessageAt',
      type: 'date',
      filterType: 'date',
      mode: MatchMode.equalsOnly,
      isSelected: true,
    },
    {
      key: 'Оценка',
      field: 'rating',
      type: 'rating',
      filterType: 'number',
      isSelected: true,
      mode: MatchMode.equalsOnly,
      width: '100px',
    },
    {
      key: 'Комментарии',
      field: 'ratingComment',
      type: 'text',
      filterType: 'text',
      isSelected: true,
      width: '170px',
    },
    {
      key: 'Оператор',
      field: 'userFullName',
      type: 'text',
      filterType: 'text',
      isSelected: true,
      width: '170px',
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
    }
  ];


  static readonly TABLE_ACTIONS: IRowAction[] = [
    {
      type: TableRowActionEnum.CHANGE_STATUS_MODAL,
      text: "Изменить статус",
      permissionName: 'SupportApplicationChangeStatus',
      iconUrl: 'icons/check-update.svg',
    },
    {
      type: TableRowActionEnum.SET_OPERATOR_MODAL,
      text: "Назначить оператора",
      permissionName: 'SupportApplicationAssignUser',
      iconUrl: 'icons/support.svg',
    }
  ]

  static readonly STATUS_PATH_TO_ID_MAP: Record<string, string> = {
    'new': '24297bf5-dc59-433a-bf06-bf4fac4ffc6d',
    'in-process': 'eb0d1ecf-3fd6-4ad7-ba00-7e738cceb177',
    'completed': 'b92f4dde-122c-4d1f-b479-bc8880ab8108',
    'rejected': 'd8a2ffd2-78f0-4a62-a4f0-683b195a55af',
    'canceled': 'ac05200f-b64a-4da7-a577-ce98c4282187',
  };

  static getStatusIdFromPath(path: string): string | null {
    return this.STATUS_PATH_TO_ID_MAP[path] ?? null;
  }

}
