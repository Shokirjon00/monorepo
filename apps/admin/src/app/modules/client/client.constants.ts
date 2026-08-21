import { ITab } from '@eskhata/util';

export class ClientConstants {

  static readonly HEADERS_TABS: ITab[] = [
    {
      label: 'Организации',
      path: '/clients/company',
      selected: true,
    },
    {
      label: 'Торговые точки',
      path: '/clients/merchant',
      permissionName: 'MerchantList',
      selected: false,
    },
    {
      label: 'Кассы',
      path: '/clients/poses',
      selected: false,
    },
  ]
}
