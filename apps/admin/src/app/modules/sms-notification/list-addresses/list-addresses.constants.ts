import { ICaption, IOptionAction } from '@eskhata/util';
import {MatchMode} from "@core/enums/match-mode.enum";
import { ITab } from '@eskhata/util';
import { TableRowActionEnum } from '@eskhata/util';

export class ListAddressesConstants {

  static readonly LIST_ADDRESSES_COLUMNS : ICaption[] = [
    {
      key: 'Статус',
      field: 'isActive',
      type: 'status-indicator',
      filterType: 'list',
      mode: MatchMode.equalsOnly,
      isFiltered: false,
      isSelected: true,
      width: '155px',
    },
    {
      key: 'Мессенджер',
      field: 'messengerType',
      type: 'text',
      filterType: 'text',
      isSortable: true,
      isFiltered: true,
      isSelected: true,
      width: '155px'
    },
    {
      key: 'Номер телефона',
      field: 'phoneNumber',
      type: 'text',
      filterType: 'text',
      isSelected: true,
      width: '100px',
    },
    {
      key: 'ID мессенджера',
      field: 'messengerId',
      type: 'text',
      filterType: 'text',
      isSelected: true,
      width: '100px',
    },
    {
      key: 'Организации',
      field: 'companyName',
      type: 'link',
      filterType: 'text',
      isSelected: true,
    },
    {
      key: 'Дата создания',
      field: 'createdAt',
      type: 'date',
      filterType: 'date',
      isSelected: true,
      width: '100px',
    },
    {
      key: 'Дата изменения',
      field: 'modifiedAt',
      type: 'date',
      filterType: 'date',
      isSelected: true,
    },
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

  static readonly TABLE_SETTING_OPTIONS: IOptionAction[] = [
    {
      type: TableRowActionEnum.CHECK_STATUS,
      key: 'check-status-id',
      permissionName: 'GetPosMessengersActiveStatus',
      optionName: 'Изменить статус',
    }
  ];
}

