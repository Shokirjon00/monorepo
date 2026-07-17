import { IOptionAction, IRowAction } from "@core/interfaces";
import { IAction } from "@shared/components/actions/action.interface";
import { ActionEnum } from "@core/enums/action-enum";
import { MatchMode } from "@core/enums/match-mode.enum";
import { TableRowActionEnum } from "@core/enums/table";
import { ICaption } from "@core/interfaces/table1.interface";

export class  ShiftHistoryConstants {

  static readonly SHIFT_HISTORY_COLUMNS : ICaption[] = [
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
      key: 'Торговая точка',
      field: 'merchantName',
      type: 'text',
      filterType: 'text',
      isSelected: true,
      width: '150px',
    },
    {
      key: 'Касса',
      field: 'posName',
      type: 'text',
      filterType: 'text',
      isSelected: true,
      width: '150px',
    },
    {
      key: 'ID смены',
      field: 'shiftNumber',
      type: 'number',
      filterType: 'number',
      mode: MatchMode.equalsOnly,
      isSelected: true,
      width: '150px',
    },
    {
      key: 'POS-терминал',
      field: 'posTerminalNumber',
      type: 'text',
      filterType: 'text',
      isSelected: true,
      width: '250px',
    },
    {
      key: 'Дата открытия',
      field: 'startDate',
      type: 'datetime',
      filterType: 'date',
      mode: MatchMode.equalsOnly,
      isSelected: true,
      width: '150px',
    },
    {
      key: 'Дата закрытия',
      field: 'endDate',
      type: 'datetime',
      filterType: 'date',
      mode: MatchMode.equalsOnly,
      isSelected: true,
      width: '150px',
    },
    {
      key: 'ФИО кассира',
      field: 'posTerminalUserFullName',
      type: 'text',
      filterType: 'text',
      isSelected: true,
      width: '150px',
    },
  ];

  static readonly ACTIONS: IAction[] = [
    {
      code: ActionEnum.EXPORT,
      tooltipName: 'Экспорт',
      path: 'shift/report',
      name: 'Экспорт',
      permissionName: 'ShiftExportToExcel'
    },
  ];

  static readonly TABLE_ACTIONS: IRowAction[] = [
    {
      type: TableRowActionEnum.PRINT,
      permissionName: 'ShiftReceipt',
      iconUrl: 'icons/print.svg',
    },
  ];

  static readonly OPTION_ACTIONS: IOptionAction[] = [
    {
      type: TableRowActionEnum.CHANGE_SHIFT,
      permissionName: 'ShiftClose',
      text: 'Закрыть смену'
    }
  ];

}
