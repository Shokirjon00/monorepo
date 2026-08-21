import { ICaption } from '@eskhata/util';
import { IAction } from '@eskhata/util';
import { ActionEnum } from '@eskhata/util';

export const MERCHANT_HISTORIES_COLUMNS: ICaption[] = [
  {
    key: 'Статус',
    field: 'merchantApplicationStatusName',
    type: 'text',
    isSelected: true,
    isSortable: true,
  },
  {
    key: 'Номер заявки',
    field: 'number',
    type: 'text',
    isSelected: true,
    isSortable: true,
    width: '200px',
  },
  {
    key: 'Название точки',
    field: 'name',
    type: 'text',
    isSelected: true,
    isSortable: true,
    width: '100px',
  },

  {
    key: 'Создан',
    field: 'createdAt',
    type: 'datetime',
    isSelected: true,
    isSortable: true,
    width: '155px',
  },
];

export const MERCHANT_ACTION: IAction[] = [
  {
    code: ActionEnum.ADD,
    tooltipName: 'Заявка на добавление точки',
    path: 'merchant/merchant/create-application',
    name: 'Заявка на добавление точки',
    permissionName: 'MerchantApplicationCreate',
  },
];
