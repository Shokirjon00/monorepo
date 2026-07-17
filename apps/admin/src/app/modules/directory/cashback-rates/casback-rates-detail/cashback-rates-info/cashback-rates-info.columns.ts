import { ICaption } from "@core/interfaces/table.interface";

export const cashbackRatesInfoColumns: ICaption[] = [
  {
    key: 'Наименование',
    field: 'name',
    type: 'text',
    filterType: 'text',
    isSelected: true,
  },
  {
    key: 'Интервал от',
    field: 'minValue',
    type: 'number',
    filterType: 'text',
    isSelected: true,
  },
  {
    key: 'Интервал до',
    field: 'maxValue',
    type: 'number',
    filterType: 'text',
    isSelected: true,
  },
  {
    key: 'Размер кэшбэка',
    field: 'value',
    type: 'number',
    filterType: 'text',
    isSelected: true,
  },
  {
    key: 'Процент',
    field: 'percentage',
    type: 'text',
    filterType: 'text',
    isSelected: true,
  },
]
