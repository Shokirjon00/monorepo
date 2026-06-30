import { ICaption, IRowAction } from "@core/interfaces/table.interface";
import { IAction } from "@shared/components/actions/actions.interface";
import { ActionEnum } from "@core/enums/action-enum";
import { TableRowActionEnum } from "@core/enums/table";

export class MailingConstants {

  static readonly MAILING_COLUMNS : ICaption[] = [
    {
      key: 'Статус',
      field: 'isActive',
      type: 'status-indicator',
      filterType: 'text',
      isFiltered: true,
      isSelected: true,
      width: '155px',
    },
    {
      key: 'Наименования',
      field: 'name',
      type: 'text',
      filterType: 'text',
      isSelected: true,
      width: '100px',
    },
    {
      key: ' Организация',
      field: 'companyName',
      type: 'link',
      filterType: 'text',
      isSelected: true,
      width: '100px',
    },
    {
      key: 'Последний запуск',
      field: 'lastRunAt',
      type: 'date',
      filterType: 'date',
      isSelected: true,
      width: '100px',
    },
    {
      key: 'Расписание',
      field: 'periodTypeName',
      type: 'text',
      filterType: 'text',
      isSelected: true,
      width: '100px',
    },
    {
      key: 'Пользователь',
      field: 'createdByName',
      type: 'text',
      filterType: 'text',
      isSelected: true,
      width: '100px',
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
  ]

  static readonly MAILING_ACTION: IAction[] = [
    {
      code: ActionEnum.ADD,
      tooltipName: 'Добавить новую рассылку',
      path: 'mailing/new',
      permissionName: 'MailingCreate'
    },
    {
      code: ActionEnum.EXPORT,
      path: 'cashback_promotion/report',
      tooltipName: 'Экспорт',
      permissionName: '-'
    },
  ]

  static readonly TABLE_ACTIONS: IRowAction[] = [
    {
      type: TableRowActionEnum.EDIT,
      permissionName: 'MailingUpdate',
      iconUrl: 'icons/pen.svg',
    }
  ]
}


