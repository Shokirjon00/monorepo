import { ICaption, IRowAction } from "@core/interfaces";
import { TableRowActionEnum } from "@core/enums/table";
import { IAction } from "@shared/components/actions/actions.interface";
import { ActionEnum } from "@core/enums/action-enum";
import { MatchMode } from "@core/enums/match-mode.enum";

export class PaymentPurposesConstants {

  static readonly DESTINATION_TEMPLATE_COLUMNS : ICaption[] = [
    {
      key: 'Статус',
      field: 'isActive',
      type: 'status-indicator',
      filterType: 'list',
      mode: MatchMode.equalsOnly,
      isFiltered: false,
      isSelected: true,
      width: '150px',
    },
    {
      key: 'Наименование',
      field: 'name',
      type: 'text',
      filterType: 'text',
      isSelected: true,
      width: '250px',
    },
    {
      key: 'Текст',
      field: 'templateText',
      type: 'text',
      filterType: 'text',
      isSelected: true,
      width: '250px',
    },
    {
      key: 'Создано',
      field: 'createdAt',
      type: 'date',
      filterType: 'date',
      isSelected: true,
    },
    {
      key: 'Пользователь',
      field: 'createdByName',
      type: 'text',
      filterType: 'text',
      isSelected: true,
      width: '300px',
    },
    {
      key: 'Значение по умолчанию',
      field: 'isDefaultName',
      type: 'text',
      filterType: 'text',
      isSelected: true,
    }
  ]

  static readonly TABLE_ACTIONS: IRowAction[] = [
    {
      type: TableRowActionEnum.EDIT,
      permissionName: 'PaymentPurposeUpdate',
      iconUrl: 'icons/pen.svg',
    }
  ]

  static readonly PAYMENT_PURPOSES_ACTIONS: IAction[] = [
    {
      code: ActionEnum.ADD,
      tooltipName: 'Добавить шаблон назначения',
      path: 'directory/payment-purposes/new',
      permissionName: 'PaymentPurposeCreate'
    }
  ];
}
