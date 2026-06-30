import { ICaption } from "@core/interfaces";

export const advanceCommissionsInfoColumns : ICaption[] = [
  {
    key: 'Наименование',
    field: 'name',
    type: 'text',
    filterType: 'text',
    isSelected: true,
    isSortable: true,
  },
  {
    key: 'Интервал от',
    field: 'minValue',
    type: 'text',
    filterType: 'text',
    isSelected: true,
    isSortable: true,
  },
  {
    key: 'Интервал до',
    field: 'maxValue',
    type: 'text',
    filterType: 'text',
    isSelected: true,
    isSortable: true,
  },
  {
    key: 'Размер кэшбэка',
    field: 'value',
    type: 'text',
    filterType: 'text',
    isSortable: true,
    isSelected: true,
  },
  {
    key: 'Тип',
    field: 'percentage',
    type: 'text',
    filterType: 'text',
    isSortable: true,
    isSelected: true,
  },
]
