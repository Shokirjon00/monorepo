import { ICaption, IRowAction } from "@core/interfaces";
import { TableFieldTypes, TableRowActionEnum } from "@core/enums/table";
import { MatchMode } from "@core/enums/match-mode.enum";
import { IAction } from "@shared/components/actions/actions.interface";
import { ActionEnum } from "@core/enums/action-enum";

export class BankConstants {

  static readonly BANK_COLUMNS : ICaption[] = [
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
      key: 'Наименование',
      field: 'name',
      type: 'text',
      filterType: 'text',
      isSelected: true,
      width: '200px',
    },
    {
      key: 'ID',
      field: 'id',
      type: 'text',
      filterType: 'text',
      isSelected: true,
      width: '100px',
    },
    {
      key: 'БИК',
      field: 'bic',
      type: 'text',
      filterType: 'text',
      isSelected: true,
      width: '200px',
    },
    {
      key: 'Кор.счёт',
      field: 'correspondentAccountNumber',
      type: 'text',
      filterType: 'text',
      isSelected: true,
      width: '200px',
    },
    {
      key: 'Возможность возврата',
      field: 'canRefundName',
      type: 'text',
      filterType: 'refund_type',
      isSelected: true,
      isSortable: false,
      isFiltered: false,
      mode: MatchMode.equalsOnly,
      width: '200px',
    },
    {
      key: 'Счет к получению',
      field: 'debitAccountAbsCode',
      type: 'text',
      filterType: 'text',
      isSelected: true,
      width: '200px',
    },
    {
      key: 'Счет к оплате',
      field: 'creditAccountAbsCode',
      type: 'text',
      filterType: 'text',
      isSelected: true,
      width: '200px',
    },
    {
      key: 'Код ABS',
      field: 'extCodeAbs',
      type: 'text',
      filterType: 'text',
      isSelected: true,
      width: '200px',
    },
    {
      key: 'Адрес',
      field: 'address',
      type: 'text',
      filterType: 'text',
      isSelected: true,
      width: '200px',
    },
    {
      key: 'Позиция',
      field: 'position',
      type: TableFieldTypes.NUMBER,
      mode: MatchMode.equalsOnly,
      filterType: 'text',
      isSelected: true,
      width: '200px',
    },
    {
      key: 'Приоритет',
      field: 'priority',
      type: TableFieldTypes.NUMBER,
      mode: MatchMode.equalsOnly,
      filterType: 'text',
      isSelected: true,
      width: '200px',
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

  static readonly TABLE_ACTIONS: IRowAction[] = [
    {
      type: TableRowActionEnum.EDIT,
      permissionName: 'BankUpdate',
      iconUrl: 'icons/pen.svg',
    },
    {
      type: TableRowActionEnum.SETTING,
      permissionName: 'BankIntegrationConfigurationUpdate',
      iconUrl: 'icons/setup.svg',
      showField: 'isIntegrated',
      showValue: true
    }
  ]

  static readonly BANK_ACTIONS: IAction[] = [
    {
      code: ActionEnum.ADD,
      tooltipName: 'Добавить банк',
      path: 'directory/bank/new',
      permissionName: 'BankCreate'
    },
    {
      code: ActionEnum.EXPORT,
      mode: MatchMode.equalsOnly,
      tooltipName: 'Экспорт',
      path: 'banks/report',
      permissionName: 'BankExportToExcel'
    },
  ];
}
