import { ICaption } from "@core/interfaces/table1.interface";
import { IAction } from "@shared/components/actions/action.interface";
import { ActionEnum } from "@core/enums/action-enum";

export class CashbackConstants {

  static readonly CASHBACK_COLUMNS: ICaption[] = [
    {
      key: 'Статус',
      field: 'isActive',
      type: 'status-indicator',
      filterType: 'text',
      isFiltered: true,
      isSelected: true,
      width: "155px",
    },
    {
      key: 'От мерчанта',
      field: 'companyCashbackName',
      fieldSecond: 'companyStartDate',
      fieldThird: 'companyEndDate',
      type: 'multiple-value',
      filterType: 'text',
      isSelected: true,
      width: "155px",
    },
    {
      key: 'От банка',
      field: 'bankCashbackName',
      fieldSecond: 'bankStartDate',
      fieldThird: 'bankEndDate',
      type: 'multiple-value',
      filterType: 'text',
      isSelected: true,
      width: "155px",
    },
    {
      key: 'Тип кэшбэка',
      field: 'cashbackCompanyTypeName',
      type: 'text',
      filterType: 'text',
      isSelected: true,
      width: "155px",
    },
    {
      key: 'Организация',
      field: 'companyName',
      type: 'text',
      filterType: 'text',
      isSelected: true,
      width: "155px",
    },
    {
      key: 'Пользователь',
      field: 'userShortName',
      type: 'text',
      filterType: 'text',
      isSelected: true,
      width: "155px",
    }
  ]

  static readonly CASHBACK_ACTION: IAction[] = [
    {
      code: ActionEnum.EXPORT,
      tooltipName: 'Экспорт',
      path: 'cashback_companies/report',
      name: 'Экспорт',
      permissionName: 'CashbackCompanyExportToExcel'
    },
  ]
}
