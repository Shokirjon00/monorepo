import {ICaption} from "@core/interfaces/table.interface";

export const RETAIL_OUTLET_HISTORIES_COLUMNS : ICaption[] = [
  {
    key: 'Статус',
    field: 'merchantApplicationStatusName',
    type: 'text',
    isSelected: true,
    isSortable: true,
  },
  {
    key: 'Владелец',
    field: 'createdByName',
    type: 'text',
    isSelected: true,
    isSortable: true,
    width: '200px',
  },
  {
    key: 'Создано',
    field: 'createdAt',
    type: 'date',
    filterType: 'date',
    isSelected: true,
  },
  {
    key: 'Комментарий',
    field: 'comment',
    type: 'text',
    isSelected: true,
    isSortable: true,
  },
]
