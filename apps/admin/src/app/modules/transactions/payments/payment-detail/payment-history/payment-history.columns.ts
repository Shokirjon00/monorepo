import {ICaption} from '@eskhata/util';

export const PAYMENTHISTORY_COLUMNS : ICaption[] = [
  {
    key: 'Статус',
    field: 'paymentStatusId',
    fieldSecond: 'paymentStatusName',
    type: 'indicator',
    filterType: 'text',
    isSelected: true,
    isFiltered: true,
    isSortable: true,
    width: '155px'
  },
  {
    key: 'Статус синхронизации',
    field: 'paymentSyncStatusName',
    type: 'text',
    isSelected: true,
    isFiltered: true,
    isSortable: true,
    width: '155px'
  },
  {
    key: 'Подробный статус ошибки',
    field: 'paymentStatusDetailName',
    type: 'text',
    isSelected: true,
    isFiltered: true,
    isSortable: true,
    width: '155px'
  },
  {
    key: 'Создан',
    field: 'createdAt',
    type: 'datetime',
    filterType: 'text',
    isSelected: true,
    isSortable: true,
  },
  {
    key: 'Пользователь',
    field: 'userName',
    type: 'text',
    filterType: 'text',
    isSelected: true,
    isSortable: true,
  },
  {
    key: 'Комментарии',
    field: 'description',
    type: 'text',
    filterType: 'text',
    isSelected: true,
    isSortable: true,
  }
]
