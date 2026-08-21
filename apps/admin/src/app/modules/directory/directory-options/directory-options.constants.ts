import { ICaption, IOptionAction, IRowAction } from "@core/interfaces";
import { MatchMode } from "@core/enums/match-mode.enum";
import { TableRowActionEnum } from '@eskhata/util';
import { IAction } from '@eskhata/util';
import { ActionEnum } from '@eskhata/util';

export class DirectoryOptionsConstants {

  static readonly DIRECTORY_OPTIONS_COLUMNS: ICaption[] = [
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
      key: 'ID',
      field: 'id',
      type: 'text',
      filterType: 'text',
      isSelected: true,
      width: '200px',
    },
    {
      key: 'Наименование',
      field: 'name',
      type: 'text',
      filterType: 'text',
      isSelected: true,
      width: '200px',
    },
    {
      key: 'Тип',
      field: 'typeName',
      type: 'text',
      filterType: 'text',
      isSelected: true,
      width: '200px',
    },
    {
      key: 'Ключ',
      field: 'key',
      type: 'text',
      isSelected: true,
      filterType: 'text',
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

  static readonly TABLE_ACTIONS: IRowAction[] = [
    {
      type: TableRowActionEnum.EDIT,
      permissionName: 'ServiceParamUpdate',
      iconUrl: 'icons/pen.svg',
    }
  ]

  static readonly DIRECTORY_OPTIONS_ACTIONS: IAction[] = [
    {
      code: ActionEnum.ADD,
      tooltipName: 'Добавить доп.параметр',
      path: 'directory/directory-options/new',
      permissionName: 'ServiceParamCreate'
    },
    {
      code: ActionEnum.EXPORT,
      tooltipName: 'Экспорт',
      path: 'service_params/report',
      permissionName: 'ServiceParamExportToExcel'
    },
  ];

  static readonly TABLE_SETTING_OPTIONS: IOptionAction[] = [
    {
      type: TableRowActionEnum.CHANGE_STATUS,
      permissionName: 'ServiceParamActiveStatus'
    }
  ];

  static readonly TYPE = [
    {name: 'Мерчант-сервис', id: 1},
    {name: 'Сервис', id: 2},
  ];
}

