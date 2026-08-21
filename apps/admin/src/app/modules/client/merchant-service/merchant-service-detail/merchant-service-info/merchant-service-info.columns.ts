import { ICaption } from '@eskhata/util';
export const MERCHANT_SERVICE_INFO_COLUMNS : ICaption[] = [
  {
    key: 'Параметры',
    field: 'serviceParamName',
    type: 'text',
    isSelected: true,
    isSortable: true,
    width: '100px',
  },
  {
    key: 'Только для чтения',
    field: 'readOnly',
    type: 'text',
    isSelected: true,
    isSortable: true,
    width: '100px',
  },
  {
    key: 'Значения по умолчанию',
    field: 'defaultValue',
    type: 'text',
    isSelected: true,
    isSortable: true,
  },
  {
    key: 'На счет',
    field: 'toAccount',
    type: 'text',
    isSelected: true,
    isSortable: true,
  }
]
