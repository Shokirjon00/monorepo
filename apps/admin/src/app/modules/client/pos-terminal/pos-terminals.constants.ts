import { ITab } from "@core/interfaces/header.interface";

export class PosTerminalsConstants {
  static getPosHeaderTabs(companyId: string, merchantId: string): ITab[] {
    return [
      {
        label: 'Кассы',
        path: `/clients/company/${companyId}/merchant/${merchantId}/poses`,
        permissionName: 'PosList'
      },
      {
        label: 'Pos-terminal',
        path: `/clients/company/${companyId}/merchant/${merchantId}/pos-terminal`,
        permissionName: 'PosTerminalList'
      },
      {
        label: 'Информация о торговой точке',
        path: `/clients/company/${companyId}/merchant/${merchantId}/info`,
        permissionName: 'MerchantDetail'
      },
      {
        label: 'Доп.параметры',
        path: `/clients/company/${companyId}/merchant/${merchantId}/service`,
        permissionName: 'MerchantServiceList'
      },
      {
        label: 'Настройки Pos-terminal',
        path: `/clients/company/${companyId}/merchant/${merchantId}/pos-terminal-setting`,
        permissionName: 'MerchantComponentList'
      },
    ]

  }

  static getPosHeader(merchantId: string): ITab[] {
    return [
      {
        label: 'Кассы',
        path: `/clients/merchant/${merchantId}/poses`,
        permissionName: 'PosList'
      },
      {
        label: 'Pos-terminal',
        path: `/clients/merchant/${merchantId}/pos-terminal`,
        permissionName: 'PosTerminalList'
      },
      {
        label: 'Информация о торговой точке',
        path: `/clients/merchant/${merchantId}/info`,
        permissionName: 'MerchantDetail'
      },
      {
        label: 'Доп.параметры',
        path: `/clients/merchant/${merchantId}/service`,
        permissionName: 'MerchantServiceList'
      },
      {
        label: 'Настройки Pos-terminal',
        path: `/clients/merchant/${merchantId}/pos-terminal-setting`,
        permissionName: 'MerchantComponentList'
      },
    ]
  }
}
