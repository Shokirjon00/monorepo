import { ITab } from "@core/interfaces/header.interface";

export class BalanceLimitConstants {

  static readonly HEADER_TABS: ITab[] = [
    {
      label: 'Счета IFT',
      path: '/balance-limit/ift',
      permissionName: 'IFTLimitDetail'
    },
    {
      label: 'Счета организаций',
      path: '/balance-limit/list',
      permissionName: 'MerchantLimitList'
    }
  ];
}

