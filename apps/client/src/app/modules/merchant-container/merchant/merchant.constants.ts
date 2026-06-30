import { ICaption } from "@core/interfaces/table1.interface";
import { TableRowActionEnum } from "@core/enums/table";
import { IRowAction, ITab } from "@core/interfaces";
import { ActionEnum } from "@core/enums/action-enum";
import { IAction } from "@shared/components/actions/action.interface";

export class MerchantConstants {

  static readonly MERCHANT_COLUMNS: ICaption[] = [
    {
      key: 'Статус',
      field: 'isActive',
      type: 'status-indicator',
      filterType: 'text',
      isFiltered: true,
      isSelected: true,
      width: "150px",
    },
    {
      key: 'Наименование',
      field: 'name',
      type: 'text',
      filterType: 'text',
      isSelected: true,
      width: "200px",
    },
    {
      key: 'ID В EQMS',
      field: 'extCodeEqms',
      type: 'text',
      isFiltered: true,
      isSortable: true,
      isSelected: true,
      width: "200px",
    },
    {
      key: 'Счет',
      field: 'accountNumber',
      type: 'text',
      isSelected: true,
      filterType: 'text',
      width: "200px",
    },
    {
      key: 'Город',
      field: 'cityName',
      type: 'text',
      isSelected: true,
      filterType: 'text',
      width: "200px",
    },
    {
      key: 'Филиал',
      field: 'branchName',
      type: 'text',
      isSelected: true,
      filterType: 'text',
      width: "200px",
    },
    {
      key: 'Создано',
      field: 'createdAt',
      type: 'datetime',
      isSelected: true,
      filterType: 'date',
      width: "200px",
    },
    {
      key: 'Количество касс',
      field: 'posCount',
      type: 'number',
      isSelected: true,
      filterType: 'text',
      width: "200px",
    }
  ]

  static readonly TABLE_ACTIONS: IRowAction[] = [
    {
      type: TableRowActionEnum.EDIT,
      permissionName: 'MerchantUpdate',
      iconUrl: 'icons/pen.svg',
    }
  ]

  static readonly MERCHANT_ACTION: IAction[] = [
    {
      code: ActionEnum.ADD,
      tooltipName: 'Добавить торговую точку',
      path: 'merchant/merchant/new',
      name: 'Добавить точку',
      permissionName: 'MerchantCreate'
    },
    {
      code: ActionEnum.EXPORT,
      tooltipName: 'Экспорт',
      path: 'merchants/report',
      name: 'Экспорт',
      permissionName: 'MerchantExportToExcel'
    },
  ]

  static readonly HEADER_TABS: ITab[] = [
    {
      label: 'Торговые точки',
      path: '/merchant/merchant',
      permissionName: 'MerchantList',
    },
    {
      label: 'Заявки',
      path: '/merchant/applications',
      permissionName: 'MerchantApplicationList',
    },
    {
      label: 'Кэшбэки',
      path: '/merchant/cashback',
      permissionName: 'CashbackCompanyList'
    },
    {
      label: 'Счета',
      path: '/merchant/account',
      permissionName: 'AccountList'
    },
    {
      label: 'Об организации',
      path: '/merchant/company-info',
      permissionName: 'CompanyDetail'
    },
  ];
}
