import { IAction } from "@shared/components/actions/actions.interface";
import { ActionEnum } from "@core/enums/action-enum";
import { ICaption, IRowAction } from "@core/interfaces";
import { TableRowActionEnum } from "@core/enums/table";
import { MatchMode } from "@core/enums/match-mode.enum";

export class ServicesConstants {

  static readonly SERVICES_ACTIONS: IAction[] = [
    {
      code: ActionEnum.ADD,
      tooltipName: 'Добавить новые сервисы',
      path: 'services/new',
      permissionName: 'ServiceCreate'
    },
  ];

  static readonly TABLE_ACTIONS: IRowAction[] = [
    {
      type: TableRowActionEnum.EDIT,
      permissionName: 'ServiceUpdate',
      iconUrl: 'icons/pen.svg',
    }
  ];

  static readonly SERVICES_COLUMNS : ICaption[] = [
    {
      key: 'Статус',
      field: 'isActive',
      type: 'status-indicator',
      filterType: 'text',
      isFiltered: true,
      isSelected: true,
      width: '150px',
    },
    {
      key: 'Название сервиса',
      field: 'name',
      type: 'text',
      filterType: 'text',
      isSelected: true,
      width: '300px',
    },
    {
      key: 'Код',
      field: 'code',
      type: 'text',
      filterType: 'text',
      isSelected: true,
      width: '150px',
    },
    {
      key: 'Код АБС',
      field: 'extCodeAbs',
      type: 'text',
      filterType: 'text',
      isSelected: true,
    },
    {
      key: 'Код процессинга',
      field: 'extCodeProcessing',
      type: 'text',
      mode: MatchMode.equalsOnly,
      filterType: 'text',
      isSelected: true,
    },
    {
      key: 'Мин.сумма',
      field: 'minValue',
      type: 'number',
      mode: MatchMode.equalsOnly,
      filterType: 'number',
      isSelected: true,
    },
    {
      key: 'Макс.сумма',
      field: 'maxValue',
      type: 'number',
      mode: MatchMode.equalsOnly,
      filterType: 'number',
      isSelected: true,
    },
    {
      key: 'Позиция',
      field: 'position',
      type: 'text',
      mode: MatchMode.equalsOnly,
      filterType: 'text',
      isSelected: true,
    },
    {
      key: 'Шлюз',
      field: 'gatewayName',
      type: 'text',
      filterType: 'text',
      isSelected: true,
    },
    {
      key: 'Комиссия',
      field: 'commissionValue',
      type: 'text',
      mode: MatchMode.equalsOnly,
      filterType: 'text',
      isSelected: true,
    },
    {
      key: 'Создан',
      field: 'createdAt',
      type: 'datetime',
      filterType: 'date',
      mode: MatchMode.equalsOnly,
      isSelected: true,
      width: '155px'
    },
    {
      key: 'Создал',
      field: 'createdByName',
      type: 'text',
      filterType: 'text',
      isSelected: true,
      width: '150px',
    },
    {
      key: 'Изменено',
      field: 'modifiedAt',
      type: 'datetime',
      filterType: 'date',
      mode: MatchMode.equalsOnly,
      isSelected: true,
      width: '155px'
    },
    {
      key: 'Изменил',
      field: 'modifiedByName',
      type: 'text',
      filterType: 'text',
      isSelected: true,
      width: '150px',
    },
  ]
}

