import { ICaption, IOptionAction, IRowAction } from '@eskhata/util';
import {TableRowActionEnum} from '@eskhata/util';
import { ITab } from '@eskhata/util';
import { ActionEnum } from '@eskhata/util';
import { IAction } from '@eskhata/util';
import { MatchMode } from "@core/enums/match-mode.enum";
import { environment as env } from "@environments/environment";

export class ShiftsConstants {

  static readonly ACTIONS: IAction[] = [
    {
      code: ActionEnum.EXPORT,
      mode: MatchMode.equalsOnly,
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
      type: TableRowActionEnum.CLOSE_SHIFT,
      permissionName: 'ShiftClose'
    }
  ];

  static readonly HEADER_TABS: ITab[] = [
    {
      label: 'Pos-терминал',
      path: '/main-terminal/pos-terminal',
    },
    {
      label: 'Мобильное приложение',
      path: '/main-terminal/mobile-app',
      permissionName: 'PosTerminalMobileList'
    },
    {
      label: 'Смена Pos-терминалов',
      path: '/main-terminal/shifts',
      permissionName: 'PosTerminalMobileList'
    },
    {
      label: 'Список POS',
      path: '/main-terminal/pos-list',
    },
  ]


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
      key: 'Организация',
      field: 'companyName',
      placeholder: 'Выберите организацию',
      filterParams: 'companyId',
      type: 'link',
      filterType: 'search-dropdown',
      apiUrl: `${env.api.companies}/${env.api.dictionary}`,
      isSelected: true,
    },
    {
      key: 'Точка',
      field: 'merchantName',
      type: 'text',
      placeholder: 'Выберите точку',
      filterParams: 'merchantId',
      apiUrl: `${env.api.merchants}/${env.api.dictionary}`,
      filterType: 'search-dropdown',
      isSelected: true,
      width: '155px'
    },
    {
      key: 'Касса',
      field: 'posName',
      type: 'text',
      placeholder: 'Выберите кассу',
      filterParams: 'posId',
      apiUrl: `${env.api.poses}/${env.api.dictionary}`,
      filterType: 'search-dropdown',
      isSelected: true,
      width: '155px'
    },
    {
      key: 'ID смены',
      field: 'shiftNumber',
      type: 'text',
      filterType: 'text',
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
      key: 'Дата открытия смены',
      field: 'startDate',
      type: 'datetime',
      filterType: 'date',
      mode: MatchMode.equalsOnly,
      isSelected: true,
      width: '150px',
    },
    {
      key: 'Дата закрытия смены',
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
}


