import { ICaption, IRowAction } from "@core/interfaces";
import { TableRowActionEnum } from "@core/enums/table";
import { IAction } from "@shared/components/actions/actions.interface";
import { ActionEnum } from "@core/enums/action-enum";

export class MerchantServiceConstants {
  static readonly MERCHANT_SERVICE_COLUMNS: ICaption[] = [
    {
      key: 'Тип кассы',
      field: 'posTypeName',
      type: 'text',
      isSelected: true,
      isSortable: true,
      width: '100px',
    },
    {
      key: 'Параметры',
      field: 'serviceParamNames',
      type: 'list',
      isSelected: true,
      isSortable: true,
      width: '100px',
    },
    {
      key: 'Только для чтения',
      field: 'readOnly',
      type: 'list',
      isSelected: true,
      isSortable: true,
      width: '100px',
    },
    {
      key: 'Значения по умолчанию',
      field: 'defaultValues',
      type: 'list',
      isSelected: true,
      isSortable: true,
    },
    {
      key: 'На счет',
      field: 'toAccount',
      type: 'list',
      isSelected: true,
      isSortable: true,
      width: '100px',
    },
  ]

  static readonly TABLE_ACTIONS: IRowAction[] = [
    {
      type: TableRowActionEnum.EDIT,
      permissionName: 'MerchantServiceUpdate',
      iconUrl: 'icons/pen.svg',
    },
    {
      type: TableRowActionEnum.DELETE,
      permissionName: 'MerchantServiceRemove',
      iconUrl: 'icons/delete.svg',
    }
  ]

  static getAction(merchantId: string): IAction[] {
    return [
      {
        code: ActionEnum.ADD,
        tooltipName: 'Добавить параметры',
        path: `clients/merchant/${merchantId}/service/new`,
        permissionName: 'CompanyCreate'
      }
    ]
  }
}
