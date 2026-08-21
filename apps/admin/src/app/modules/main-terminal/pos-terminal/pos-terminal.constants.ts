import {ICaption, IRowAction} from '@eskhata/util';
import {TableRowActionEnum} from '@eskhata/util';
import { ITab } from '@eskhata/util';
import {environment as env} from "@environments/environment";

export class PosTerminalConstants {

  static readonly TABLE_ACTIONS: IRowAction[] = [
    {
      type: TableRowActionEnum.EDIT,
      permissionName: 'PosTerminalUpdate',
      iconUrl: 'icons/pen.svg',
    },
    {
      type: TableRowActionEnum.DELETE,
      permissionName: 'PosTerminalDelete',
      iconUrl: 'icons/delete.svg',
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

  static readonly POS_TERMINAL_COLUMNS : ICaption[] = [
    {
      key: 'Серийный номер',
      field: 'number',
      type: 'text',
      filterType: 'text',
      isSelected: true,
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
      key: 'Торговая точка',
      field: 'merchantName',
      type: 'text',
      isSelected: true,
      filterType: 'text',
    },
    {
      key: 'Касса',
      field: 'posName',
      type: 'text',
      filterType: 'text',
      isSelected: true,
    },
    {
      key: 'UID',
      field: 'codeUid',
      type: 'text',
      filterType: 'text',
      isSelected: true,
    },
    {
      key: 'Номер телефона',
      field: 'phoneNumber',
      type: 'text',
      filterType: 'text',
      isSelected: true,
    },
    {
      key: 'Адрес',
      field: 'address',
      type: 'text',
      filterType: 'text',
      isSelected: true,
    },
    {
      key: 'Наименование',
      field: 'name',
      type: 'text',
      filterType: 'text',
      isSelected: true,
    },
    {
      key: 'Код ABS',
      field: 'extCodeAbs',
      type: 'text',
      filterType: 'text',
      isSelected: true,
      width: '200px',
    },
    {
      key: 'Модель',
      field: 'model',
      type: 'text',
      filterType: 'text',
      isSelected: true,
    },
    {
      key: 'Версия приложения',
      field: 'appVersion',
      type: 'text',
      filterType: 'text',
      isSelected: true,
    },
    {
      key: 'Операционная система',
      field: 'os',
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
      key: 'Изменено',
      field: 'modifiedAt',
      type: 'date',
      filterType: 'date',
      isSelected: true,
    },
  ];
}

