import { ICaption, IRowAction } from "@core/interfaces";
import { TableRowActionEnum } from '@eskhata/util';
import { IAction } from '@eskhata/util';
import { ActionEnum } from '@eskhata/util';

export class CompanyAcquirerConstants {

  static readonly COMPANY_ACQUIRER_COLUMNS: ICaption[] = [
    {
      key: 'ID',
      field: 'id',
      type: 'text',
      filterType: 'text',
      isSelected: true,
      width: '200px',
    },
    {
      key: 'Наименование',
      field: 'name',
      type: 'text',
      filterType: 'text',
      isSelected: true,
      width: '200px',
    },
    {
      key: 'Шлюз',
      field: 'gatewayName',
      type: 'text',
      filterType: 'text',
      isSelected: true,
      width: '300px',
    },
    {
      key: 'Приоритет',
      field: 'priority',
      type: 'text',
      filterType: 'text',
      isSelected: true,
    },
  ]

  static readonly TABLE_ACTIONS: IRowAction[] = [
    {
      type: TableRowActionEnum.DELETE,
      permissionName: 'CompanyAcquirersDelete',
      iconUrl: 'icons/delete.svg',
    }
  ]

  static getAction(companyId: string): IAction[] {
    return [
      {
        code: ActionEnum.OPEN_DIALOG,
        dialogName: 'company-acquirer-dialog',
        tooltipName: 'Новый эквайер',
        name: 'Новый эквайер',
        permissionName: 'CompanyAcquirersCreate'
      },
      {
        code: ActionEnum.EDIT,
        path: `clients/company/${companyId}/edit`,
        tooltipName: 'Редактировать организацию',
        name: 'Редактировать',
        permissionName: 'CompanyUpdate'
      },
      {
        code: ActionEnum.SYNC_PAYMENT,
        tooltipName: 'Синхронизация эквайеров ',
        permissionName: 'EQMSCompanyAquarerSync'
      },
    ]
  }
}
