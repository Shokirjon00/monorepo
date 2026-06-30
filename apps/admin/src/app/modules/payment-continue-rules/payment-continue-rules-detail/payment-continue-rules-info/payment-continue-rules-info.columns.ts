import {ICaption} from "@core/interfaces/table.interface";

export const paymentContinueRulesInfoColumns : ICaption[] = [
  {
    key: 'Статус',
    field: 'isActive',
    type: 'status-indicator',
    filterType: 'text',
    isFiltered: true,
    isSelected: true,
    width: '150px',
  },
  {
    key: 'Статус платежа для изменения',
    field: 'paymentStatusName',
    type: 'text',
    filterType: 'text',
    isSelected: true,
    width: '300px',
  },
  {
    key: 'Статус синхронизации платежа для изменения',
    field: 'paymentSyncStatusName',
    type: 'text',
    filterType: 'text',
    isSelected: true,
    width: '300px',
  },
  {
    key: 'Сообщение',
    field: 'message',
    type: 'text',
    filterType: 'text',
    isSelected: true,
    width: '300px',
  },
]
