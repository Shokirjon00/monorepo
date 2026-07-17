import { ICaption } from "@core/interfaces";
import { MatchMode } from "@core/enums/match-mode.enum";
import { ActionEnum } from "@core/enums/action-enum";

export class InfoDetailConstants {

  static getActions(withAmountId: string): any {
    return [
      {
        code: ActionEnum.EXPORT,
        tooltipName: 'Экспорт',
        path: 'issue_money_registry_merchants/report/' + withAmountId,
        permissionName: 'PaymentExportToExcel'
      },
    ]
  }

  static readonly INFO_DETAIL_COLUMNS: ICaption[] = [
    {
      key: 'ID платежа',
      field: 'paymentId',
      type: 'text',
      filterType: 'text',
      isSelected: true,
    },
    {
      key: 'Дата и время',
      field: 'createdAt',
      type: 'datetime',
      filterType: 'date',
      isSelected: true,
    },
    {
      key: 'Период вывода',
      field: 'period',
      type: 'text',
      filterType: 'date',
      isSelected: true,
      width: '155px',
    },
    {
      key: 'Организация',
      field: 'companyName',
      type: 'link',
      filterType: 'text',
      isSelected: true,
    },
    {
      key: 'Торговая точка',
      field: 'merchantName',
      type: 'text',
      filterType: 'text',
      isSelected: true,
    },
    {
      key: 'Сумма',
      field: 'amount',
      type: 'number',
      filterType: 'number',
      isSelected: true,
      mode: MatchMode.equalsOnly,
      width: '155px',
    },
    {
      key: 'Тип',
      field: 'issueMoneyPeriodTypeName',
      type: 'text',
      filterType: 'text',
      isSelected: true,
      width: '155px',
    },
    {
      key: 'Статус платежа',
      field: 'paymentStatusName',
      type: 'text',
      filterType: 'text',
      isSelected: true,
      width: '155px',
    },
    {
      key: 'Подробный статус платежа',
      field: 'paymentStatusDetailName',
      type: 'text',
      filterType: 'text',
      isSelected: true,
      width: '155px',
    },
    {
      key: 'Комментария',
      field: 'description',
      type: 'text',
      filterType: 'text',
      isSelected: true,
    },
    {
      key: '',
      field: '',
      type: 'edit',
      filterType: 'text',
      isSelected: true,
      permissionName: 'IssueMoneyUpdate',
      width: '65px',
      isSortable: true,
    }
  ]
}

