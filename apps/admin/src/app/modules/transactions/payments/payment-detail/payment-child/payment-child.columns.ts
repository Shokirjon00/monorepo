import {ICaption} from "@core/interfaces/table.interface";

export const PAYMENTCHILD_COLUMNS : ICaption[] = [
  {
    key: 'Галочки',
    field: '',
    type: 'select',
    filterType: 'text',
    isSelected: true,
    width: '60px'
  },
  {
    key: 'Статус',
    field: 'paymentStatusGroupId',
    fieldSecond: 'paymentStatusGroupName',
    type: 'indicator',
    filterType: 'text',
    isSelected: true,
    width: '155px'
  },
  {
    key: 'Создан',
    field: 'createdAt',
    type: 'datetime',
    filterType: 'date',
    isSelected: true,
  },
  {
    key: 'Завершён',
    field: 'finishedAt',
    type: 'datetime',
    filterType: 'date',
    isSelected: true,
  },
  {
    key: 'Сумма',
    field: 'amount',
    type: 'text',
    filterType: 'text',
    isSelected: true,
  },
  {
    key: 'Сервис',
    field: 'serviceName',
    type: 'text',
    filterType: 'text',
    isSelected: true,
  },
  {
    key: 'Номер документа',
    field: 'number',
    type: 'text',
    filterType: 'text',
    isSelected: true,
  },
  {
    key: 'Шлюз плательщика',
    field: 'fromGatewayName',
    type: 'text',
    filterType: 'text',
    isSelected: true,
  },
  {
    key: 'Шлюз получателя',
    field: 'toGatewayName',
    type: 'text',
    filterType: 'text',
    isSelected: true,
  },
  {
    key: 'Подробный статус',
    field: 'paymentStatusName',
    type: 'text',
    filterType: 'text',
    isSelected: true,
  },
  {
    key: 'Статсус синхронизации',
    field: 'paymentSyncStatusName',
    type: 'text',
    filterType: 'text',
    isSelected: true,
  },
  {
    key: 'Статус ошибки',
    field: 'paymentStatusDetailName',
    type: 'text',
    filterType: 'text',
    isSelected: true,
  }
]
