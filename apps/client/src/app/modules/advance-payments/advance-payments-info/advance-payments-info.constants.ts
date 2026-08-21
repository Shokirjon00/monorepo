import { ICaption } from '@eskhata/util';
import { MatchMode } from "@core/enums/match-mode.enum";

export class AdvancePaymentsInfoConstants {

  static readonly ADVANCE_PAYMENTS_INFO_COLUMNS: ICaption[] = [
    {
      key: 'Тип операции',
      field: 'serviceName',
      type: 'text',
      filterType: 'text',
      isSelected: true,
      width: "155px",
    },
    {
      key: 'Дата',
      field: 'createdAt',
      type: 'datetime',
      filterType: 'date',
      mode: MatchMode.equalsOnly,
      isSelected: true,
      width: "155px"
    },
    {
      key: 'Остаток на начало',
      field: 'balanceBefore',
      type: 'number',
      filterType: 'number',
      mode: MatchMode.equalsOnly,
      isSelected: true,
      width: "155px",
    },
    {
      key: 'Сумма',
      field: 'amount',
      type: 'number',
      filterType: 'number',
      mode: MatchMode.equalsOnly,
      isSelected: true,
      width: "155px",
    },
    {
      key: 'Остаток долга',
      field: 'balance',
      type: 'number',
      filterType: 'number',
      mode: MatchMode.equalsOnly,
      isSelected: true,
      width: "155px",
    },
  ];
}
