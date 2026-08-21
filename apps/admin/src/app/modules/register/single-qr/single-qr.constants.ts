import {ICaption} from '@eskhata/util';
import {TableFieldTypes} from '@eskhata/util';
import { ITab } from '@eskhata/util';
import { MatchMode } from "@core/enums/match-mode.enum";

export class SingleQrConstants {

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

  static readonly SINGLE_QR_COLUMNS : ICaption[] = [
    {
      key: 'Дата',
      field: 'createDateTime',
      type: TableFieldTypes.DATE,
      filterType: 'date',
      isSelected: true,
    },
    {
      key: 'Сумма вх.',
      field: 'creditSum',
      type: TableFieldTypes.TEXT,
      mode: MatchMode.equalsOnly,
      filterType: 'text',
      isSelected: true,
    },
    {
      key: 'Кол-во вх.',
      field: 'creditCount',
      type: TableFieldTypes.TEXT,
      mode: MatchMode.equalsOnly,
      filterType: 'text',
      isSelected: true,
    },
    {
      key: 'Период',
      field: 'bankCashbackName',
      fieldSecond: 'fromDateTime',
      fieldThird: 'toDateTime',
      type: 'multiple-value',
      filterType: 'text',
      isFiltered: true,
      isSortable: true,
      isSelected: true,
      width: '100px',
    },
    {
      key: 'Сумма исх.',
      field: 'debitSum',
      type: TableFieldTypes.TEXT,
      filterType: 'text',
      mode: MatchMode.equalsOnly,
      isSelected: true,
    },
    {
      key: 'Кол-во исх.',
      field: 'debitCount',
      type: TableFieldTypes.TEXT,
      filterType: 'text',
      mode: MatchMode.equalsOnly,
      isSelected: true,
    },
    {
      key: 'Страница',
      field: 'page',
      type: TableFieldTypes.TEXT,
      filterType: 'text',
      isSelected: true,
      isFiltered: true,
      isSortable: true,
    },
    {
      key: 'Ссылка',
      field: 'registryFileStorageId',
      type: 'download',
      isSortable: true,
      isFiltered: true,
      isSelected: true,
    },
    {
      key: 'Создано',
      field: 'createdAt',
      type: 'date',
      filterType: 'date',
      isSelected: true,
    }
  ]
}

