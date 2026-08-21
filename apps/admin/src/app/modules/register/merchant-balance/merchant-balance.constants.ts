import { ICaption } from '@eskhata/util';
import { ITab } from '@eskhata/util';

export class MerchantBalanceConstants {

  /**
   *
   */
  static readonly MERCHANT_BALANCE_COLUMNS : ICaption[] = [
    {
      key: 'Название файла',
      field: 'name',
      type: 'text',
      filterType: 'text',
      isSelected: true,
    },
    {
      key: 'Создано',
      field: 'createdAt',
      type: 'date',
      filterType: 'date',
      isSelected: true,
    },
    {
      key: 'Ссылка',
      field: 'fileId',
      type: 'download',
      isSortable: true,
      isFiltered: true,
      isSelected: true,
    }
  ]

  static readonly HEADER_TABS: ITab[]= [
      {
        label: 'Остаток мерчантов',
        path: '/register/merchant-balance',
        permissionName: 'RegistryOfBalanceList'
      },
      {
        label: 'Единый QR',
        path: '/register/single-qr',
        permissionName: 'RegistryOfSingleQRIFTPaymentsList'
      },
      {
        label: 'Синхронизация с АБС',
        path: '/register/registry-abs-sync',
        permissionName: 'RegistryAbsSyncList'
      },
  ]
}

