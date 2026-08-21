import { ICaption, IRowAction } from '@eskhata/util';
import { TableRowActionEnum } from '@eskhata/util';
import { ITab } from '@eskhata/util';

export class PromotionSystemConstants {

  static readonly PROMOTION_SYSTEM_COLUMNS : ICaption[] = [
    {
      key: 'Наименование',
      field: 'description',
      type: 'text',
      filterType: 'text',
      isSelected: true,
      width: '350px',
    },
    {
      key: 'Дата изменения',
      field: 'modifiedAt',
      type: 'datetime',
      filterType: 'date',
      isSelected: true,
      width: '170px',
    },
  ]

  static readonly TABLE_ACTIONS: IRowAction[] = [
    {
      type: TableRowActionEnum.EDIT,
      permissionName: 'MerchantLimitUpdate',
      iconUrl: 'icons/pen.svg',
    }
  ]

  static readonly HEADER_TABS: ITab[] = [
    {
      label: 'Системные оповещения',
      path: '/promotion-system/list'
    },
    {
      label: 'Пользовательские',
      path: '/promotion-system/custom-notifications'
    },
    {
      label: 'Список адресатов',
      path: '/promotion-system/list-addresses'
    }
  ]
}

