import { ICaption } from "@core/interfaces/table1.interface";
import { MatchMode } from "@core/enums/match-mode.enum";
import { IAction } from "@shared/components/actions/action.interface";
import { ActionEnum } from "@core/enums/action-enum";

export class AccountConstants {

  static readonly ACCOUNT_COLUMNS: ICaption[] = [
    {
      key: 'Статус',
      field: 'isActive',
      fieldSecond: 'statusName',
      type: 'status-indicator',
      filterType: 'text',
      isFiltered: false,
      mode: MatchMode.contains,
      isSelected: true,
      width: '155px',
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
      key: 'Номер счета',
      field: 'number',
      type: 'text',
      filterType: 'text',
      isSelected: true,
      width: "155px",
    },
    {
      key: 'Валюта',
      field: 'currencyName',
      type: 'text',
      filterType: 'text',
      isSelected: true,
      width: "155px",
    },
    {
      key: 'Тип счета',
      field: 'accountTypeName',
      type: 'text',
      filterType: 'text',
      isSelected: true,
      width: "155px",
    },
    {
      key: 'Банк',
      field: 'bankName',
      type: 'text',
      filterType: 'text',
      isSelected: true,
      width: "155px",
    }
  ]

  static readonly ACCOUNT_ACTION: IAction[] = [
    {
      code: ActionEnum.EXPORT,
      tooltipName: 'Экспорт',
      path: 'accounts/report',
      name: 'Экспорт',
      permissionName: 'AccountExportToExcel'
    },
  ]
}
