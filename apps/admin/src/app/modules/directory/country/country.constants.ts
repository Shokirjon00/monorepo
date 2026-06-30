import { ICaption, IRowAction } from "@core/interfaces";
import { TableRowActionEnum } from "@core/enums/table";
import { IAction } from "@shared/components/actions/actions.interface";
import { ActionEnum } from "@core/enums/action-enum";
import { MatchMode } from "@core/enums/match-mode.enum";

export class CountryConstants {

  static readonly COUNTRY_COLUMNS : ICaption[] = [
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
      key: 'Описание',
      field: 'description',
      type: 'text',
      filterType: 'text',
      isSelected: true,
    },
    {
      key: 'ISO2',
      field: 'iso2',
      type: 'text',
      filterType: 'text',
      isSelected: true,
      width: '100px',
    },
    {
      key: 'ISO3',
      field: 'iso3',
      type: 'text',
      filterType: 'text',
      isSelected: true,
      width: '150px',
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
      permissionName: 'CountryUpdate',
      iconUrl: 'icons/pen.svg',
    }
  ]

  static readonly COUNTRY_ACTIONS: IAction[] = [
    {
      code: ActionEnum.ADD,
      tooltipName: 'Добавить страну',
      path: 'directory/country/new',
      permissionName: 'CountryCreate'
    },
    {
      code: ActionEnum.EXPORT,
      tooltipName: 'Экспорт',
      path: 'countries/report',
      permissionName: 'CountryExportToExcel'
    },
  ];
}
