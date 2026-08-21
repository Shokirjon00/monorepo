import { ICaption } from "@core/interfaces";
import { TableFieldTypes } from '@eskhata/util';

export class BalanceLimitIftConstants {

  static readonly BALANCE_LIMIT_IFT_COLUMNS: ICaption[] = [
    {
      key: 'Дата и время',
      field: 'createDateTime',
      type: TableFieldTypes.DATE,
      filterType: 'text',
      isSelected: true,
      isSortable: true,
    },
    {
      key: 'Создано',
      field: 'createdAt',
      type: 'date',
      filterType: 'date',
      isSelected: true,
    },
    {
      key: 'Создал',
      field: 'createdByName',
      type: 'text',
      filterType: 'text',
      isSelected: true,
    },
    {
      key: 'Номер счёта',
      field: 'accountNumber',
      type: 'text',
      filterType: 'text',
      isSelected: true,
      isSortable: true,
    },
    {
      key: 'Установленное значение',
      field: 'limitAmount',
      type: 'text',
      filterType: 'text',
      isSelected: true,
      isSortable: true,
    },
    {
      key: 'Статус',
      field: 'status',
      type: 'text',
      filterType: 'text',
      isSelected: true,
      isSortable: true,
    },
    {
      key: 'Описание',
      field: 'description',
      type: 'text',
      filterType: 'text',
      isSelected: true,
      isSortable: true,
    },
    {
      key: 'Изменено',
      field: 'modifiedAt',
      type: 'date',
      filterType: 'date',
      isSelected: true,
    },
    {
      key: 'Изменил',
      field: 'modifiedByName',
      type: 'text',
      filterType: 'text',
      isSelected: true,
    }
  ]
}

