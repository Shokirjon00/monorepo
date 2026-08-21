import { ICaption, IRowAction } from '@eskhata/util';
import { TableRowActionEnum } from '@eskhata/util';
import { IAction } from '@eskhata/util';
import { ActionEnum } from '@eskhata/util';

export class BankPromotionConstants {

  static readonly BANK_PROMOTION_COLUMNS : ICaption[] = [
    {
      key: 'Статус',
      field: 'isActive',
      type: 'status-indicator',
      filterType: 'text',
      isFiltered: true,
      isSelected: true,
      width: '155px',
    },
    {
      key: 'От банка',
      field: 'bankCashbackName',
      fieldSecond: 'bankStartDate',
      fieldThird: 'bankEndDate',
      type: 'multiple-value',
      filterType: 'text',
      isSelected: true,
      width: '100px',
    },
    {
      key: 'Тип кэшбэка',
      field: 'cashbackAccrualTypeName',
      type: 'text',
      filterType: 'text', isSelected: true,
      width: '100px',
    },
    {
      key: 'Начислить на сумму',
      field: 'cashbackLimitName',
      type: 'text',
      filterType: 'text', isSelected: true,
      width: '100px',
    },
    {
      key: 'Создано',
      field: 'createdAt',
      type: 'date',
      filterType: 'date',
      isSelected: true,
    },
    {
      key: 'Создал',
      field: 'createdByName',
      type: 'text',
      filterType: 'text',
      isSelected: true,
    },
    {
      key: 'Изменено',
      field: 'modifiedAt',
      type: 'date',
      filterType: 'date',
      isSelected: true,
    },
    {
      key: 'Изменил',
      field: 'modifiedByName',
      type: 'text',
      filterType: 'text',
      isSelected: true,
    }
  ]

  static readonly BANK_PROMOTION_ACTION: IAction[] = [
    {
      code: ActionEnum.ADD,
      tooltipName: 'Добавить акцию банка',
      path: 'bank-promotion/new',
      permissionName: 'CashbackPromotionCreate'
    },
    {
      code: ActionEnum.EXPORT,
      path: 'cashback_promotion/report',
      tooltipName: 'Экспорт',
      permissionName: 'CashbackPromotionExportToExcel'
    },
  ]

  static readonly TABLE_ACTIONS: IRowAction[] = [
    {
      type: TableRowActionEnum.EDIT,
      permissionName: 'CashbackPromotionUpdate',
      iconUrl: 'icons/pen.svg',
    }
  ]
}

