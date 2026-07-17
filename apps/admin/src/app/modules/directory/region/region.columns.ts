import {ICaption} from "@core/interfaces/table.interface";
import { MatchMode } from '@core/enums/match-mode.enum';

export const REGION_COLUMNS : ICaption[] = [
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
    width: '300px',
  },
  {
    key: 'Страна',
    field: 'countryName',
    type: 'text',
    filterType: 'text',
    isSelected: true,
    width: '150px',
  },
  {
    key: 'Описание',
    field: 'description',
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
