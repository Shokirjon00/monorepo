import {ICaption, IRowAction} from "@core/interfaces/table.interface";
import {TableRowActionEnum} from "@core/enums/table";
import { ITab } from "@core/interfaces/header.interface";
import {IAction} from "@shared/components/actions/actions.interface";
import {ActionEnum} from "@core/enums/action-enum";

export class ChangePosTerminalConstants {

  static readonly TABLE_ACTIONS: IRowAction[] = [
    {
      type: TableRowActionEnum.EDIT,
      permissionName: 'PosTerminalUpdate',
      iconUrl: 'icons/pen.svg',
    },
  ];

  static readonly HEADER_ACTIONS: IAction[] = [
    {
      code: ActionEnum.IMPORT_EXCEL,
      permissionName: 'TerminalImportFromExcel',
      path: 'terminals/import_excel',
      tooltipName: 'Импорт',
    },
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

  static readonly POS_TERMINAL_COLUMNS : ICaption[] = [
    {
      key: 'Статус терминала',
      field: 'terminalStatusName',
      type: 'text',
      filterParams: 'terminalStatusId',
      filterType: 'terminal_status',
      isSelected: true,
      isFiltered: false,
      isSortable: true,
    },
    {
      key: 'TID',
      field: 'terminalId',
      type: 'text',
      filterType: 'text',
      isSelected: true,
    },
    {
      key: 'Организация',
      field: 'companyName',
      type: 'link',
      filterType: 'text',
      isSelected: true,
    },
    {
      key: 'Торговая точка',
      field: 'merchantName',
      type: 'text',
      filterType: 'text',
      isSelected: true,
    },
    {
      key: 'Адрес',
      field: 'merchantAddress',
      type: 'text',
      filterType: 'text',
      isSelected: true,
    },
    {
      key: 'Касса',
      field: 'posName',
      type: 'text',
      filterType: 'text',
      isSelected: true,
    },
    {
      key: 'Тип кассы',
      field: 'posTypeName',
      type: 'text',
      filterType: 'text',
      isSelected: true,
    },
    {
      key: 'Инвентарный номер',
      field: 'inventoryNumber',
      type: 'text',
      filterType: 'text',
      isSelected: true,
    },
    {
      key: 'SN Терминала',
      field: 'terminalSerialNumber',
      type: 'text',
      filterType: 'text',
      isSelected: true,
    },
    {
      key: 'Модель терминала',
      field: 'terminalModelName',
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
  ];
}
