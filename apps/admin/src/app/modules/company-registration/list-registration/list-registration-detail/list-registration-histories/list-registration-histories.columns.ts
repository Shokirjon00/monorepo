import {ICaption} from '@eskhata/util';

export const lIST_REGISTRATION_HISTORIES_COLUMNS : ICaption[] = [
  {
    key: 'Статус',
    field: 'companyRegistrationApplicationStatusName',
    type: 'text',
    isSelected: true,
    isSortable: true,
  },
  {
    key: 'ID заявки',
    field: 'id',
    type: 'text',
    isSelected: true,
    isSortable: true,
    width: '200px',
  },
  {
    key: 'Создан',
    field: 'createdAt',
    type: 'datetime',
    isSelected: true,
    isSortable: true,
    width: '155px'
  },
  {
    key: 'Изменил',
    field: 'adminUserFullName',
    type: 'text',
    isSelected: true,
    isSortable: true,
    width: '100px',
  },
  {
    key: 'Комментарий',
    field: 'comment',
    type: 'text',
    isSelected: true,
    isSortable: true,
  },
]
