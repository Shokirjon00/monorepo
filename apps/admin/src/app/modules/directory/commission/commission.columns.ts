import {ICaption} from "@core/interfaces/table.interface";
import { MatchMode } from '@core/enums/match-mode.enum';

export const COMMISSION_COLUMNS : ICaption[] = [
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
    width: '300px',
  },
  {
    key: 'Наименование',
    field: 'name',
    type: 'text',
    filterType: 'text',
    isSelected: true,
  },
  {
    key: 'Дата начало',
    field: 'startDate',
    type: 'date',
    filterType: 'date',
    isSelected: true,
    width: '170px',
  },
  {
    key: 'Дата окончание',
    field: 'endDate',
    type: 'date',
    filterType: 'date',
    isSelected: true,
  },
  {
    key: 'Значение по умолчанию',
    field: 'isDefaultName',
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
