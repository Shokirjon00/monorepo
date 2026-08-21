import { ITab } from '@eskhata/util';

export class UserConstants {

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
