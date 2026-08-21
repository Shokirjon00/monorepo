import { ICaption } from '@eskhata/util';
import { MatchMode } from "@core/enums/match-mode.enum";

export class AdvancePaymentsConstants {

  static readonly ADVANCE_PAYMENTS_COLUMNS : ICaption[] = [
    {
      key: 'Статус',
      field: 'statusName',
      fieldSecond: 'statusName',
      type: 'indicator',
      filterType: 'text',
      isFiltered: true,
      isSelected: true,
      width: '155px',
    },
    {
      key: 'Сумма',
      field: 'advancePaymentAmount',
      type: 'number',
      filterType: 'text',
      mode: MatchMode.equalsOnly,
      isSelected: true,
      width: "155px",
    },
    {
      key: 'Задолженность',
      field: 'amountRemain',
      type: 'text',
      filterType: 'text',
      mode: MatchMode.equalsOnly,
      isSelected: true,
      width: "155px",
    },
    {
      key: 'Дата выдачи',
      field: 'issuedAt',
      type: 'datetime',
      filterType: 'date',
      mode: MatchMode.equalsOnly,
      isSelected: true,
      width: "155px",
    },

    {
      key: 'Срок погашения',
      field: 'expiredAt',
      type: 'datetime',
      filterType: 'date',
      mode: MatchMode.equalsOnly,
      isSelected: true,
      width: "155px",
    },
    {
      key: 'Дата погашения',
      field: 'repaymentAt',
      type: 'datetime',
      filterType: 'date',
      mode: MatchMode.equalsOnly,
      isSelected: true,
      width: "155px",
    },
    {
      key: 'Дней проссрочено',
      field: 'expiredDays',
      type: 'number',
      mode: MatchMode.greaterThanOrEqual,
      filterType: 'text',
      isSelected: true,
      width: "155px",
    }
  ];

}
