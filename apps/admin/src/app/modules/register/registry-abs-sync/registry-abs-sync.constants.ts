import {ICaption} from "@core/interfaces/table.interface";
import {TableFieldTypes} from "@core/enums/table";
import { ITab } from "@core/interfaces/header.interface";
import { IAction } from "@shared/components/actions/actions.interface";
import { ActionEnum } from "@core/enums/action-enum";

export class RegistryAbsSync {

  static readonly REGISTRY_ABS_SYNC_ACTIONS: IAction[] = [
    {
      code: ActionEnum.EXPORT,
      tooltipName: 'Экспорт',
      path: 'registry_abs_sync/report',
      permissionName: 'RegistryAbsSyncListReport'
    },
  ];

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

  static readonly REGISTRY_ABS_SYNC_COLUMNS : ICaption[] = [
    {
      key: 'Тип записи',
      field: 'entityTypeName',
      type: 'text',
      isFiltered: true,
      isSelected: true,
      isSortable: true,
    },
    {
      key: 'Название организации',
      field: 'companyName',
      type: 'link',
      isSelected: true,
      isFiltered: true,
      isSortable: true,
    },
    {
      key: 'ID',
      field: 'id',
      type: 'text',
      filterType: 'text',
      isSelected: true,
      isSortable: true,
      width: '150px',
    },
    {
      key: 'ID в EQMS',
      field: 'extCodeEqms',
      type: 'text',
      isSelected: true,
      isFiltered: true,
      isSortable: true,
      width: '150px',
    },
    {
      key: 'Отправлено',
      field: 'sendedAt',
      type: TableFieldTypes.DATE,
      filterType: 'date',
      isSelected: true,
      isSortable: true,
    },
    {
      key: 'Подтверждено',
      field: 'confirmedAt',
      type: TableFieldTypes.DATE,
      filterType: 'date',
      isSelected: true,
      isSortable: true,
    },
    {
      key: 'Создано',
      field: 'createdAt',
      type: 'date',
      filterType: 'date',
      isSelected: true,
      isSortable: true
    },
    {
      key: 'Изменено',
      field: 'modifiedAt',
      type: 'date',
      filterType: 'date',
      isSelected: true,
      isSortable: true
    },
  ]
}
