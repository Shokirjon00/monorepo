import {ICaption} from '@eskhata/util';

export const commissionInfoColumns : ICaption[] = [
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
    type: 'text',
    filterType: 'text',
    isSelected: true,
  },
  {
    key: 'Интервал до',
    field: 'maxValue',
    type: 'text',
    filterType: 'text',
    isSelected: true,
  },
  {
    key: 'Размер кэшбэка',
    field: 'value',
    type: 'text',
    filterType: 'text',
    isSelected: true,
  },
  {
    key: 'Тип',
    field: 'percentage',
    type: 'text',
    filterType: 'text',
    isSelected: true,
  },
]
