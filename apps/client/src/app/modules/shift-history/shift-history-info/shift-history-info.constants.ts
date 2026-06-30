import { ICaption } from "@core/interfaces/table1.interface";
import { MatchMode } from "@core/enums/match-mode.enum";
import { TableFieldTypes } from "@core/enums/table";
import { TableStatusEnum } from "@core/enums/table-status.enum";

export class  ShiftHistoryInfoConstants {

  static readonly SHIFT_HISTORY_INFO_COLUMNS: ICaption[] = [
    {
      key: 'Статус',
      field: 'paymentStatusGroupId',
      fieldSecond: 'paymentStatusGroupName',
      type: 'indicator',
      isFiltered: true,
      filterType: 'text',
      isSelected: true,
      width: "155px"
    },
    {
      key: 'Подробный статус ошибки',
      field: 'paymentStatusDetailName',
      type: 'text',
      filterType: 'text',
      isSelected: true,
      width: "155px"
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
      key: 'Сумма',
      field: 'amount',
      type: 'number',
      filterType: 'number',
      mode: MatchMode.equalsOnly,
      isSelected: true,
      width: "155px"
    },
    {
      key: 'Комиссия',
      field: 'commissionAmount',
      type: 'number',
      filterType: 'text',
      mode: MatchMode.equalsOnly,
      isSelected: true,
      width: "155px"
    },
    {
      key: 'Номер',
      field: 'number',
      type: 'number',
      filterType: 'number',
      mode: MatchMode.equalsOnly,
      isSelected: true,
      width: "155px"
    },
    {
      key: 'Информация',
      field: 'params',
      type: 'list',
      filterType: 'text',
      isFiltered: true,
      isSelected: true,
      isSortable: true,
      mode: MatchMode.equalsOnly,
      width: "155px"
    },
    {
      key: 'Банк Эмитент',
      field: 'bankEmitentName',
      type: 'text',
      filterType: 'text',
      mode: MatchMode.contains,
      isSelected: true,
      width: "155px"
    },
    {
      key: 'Кошелёк',
      field: 'userMsisdn',
      type: 'text',
      filterType: 'text',
      mode: MatchMode.contains,
      isSelected: true,
      width: "155px"
    },

    {
      key: 'Клиент',
      field: 'userFullName',
      type: 'text',
      filterType: 'text',
      mode: MatchMode.contains,
      isSelected: true,
      width: "155px"
    },
    {
      key: 'Тип кассы',
      field: 'posTypeName',
      type: 'text',
      filterType: 'text',
      isSelected: true,
      width: "155px"
    },
    {
      key: 'Адрес',
      field: 'address',
      type: 'text',
      filterType: 'text',
      mode: MatchMode.contains,
      isSelected: true,
      width: "155px"
    },
    {
      key: 'Кэш. от мерчанта',
      field: 'merchantCashbackAmount',
      type: 'number',
      filterType: 'text',
      mode: MatchMode.equalsOnly,
      isSelected: true,
      width: "155px"
    },
    {
      key: 'К оплате',
      field: 'toPayAmount',
      type: 'number',
      filterType: 'number',
      mode: MatchMode.equalsOnly,
      isSelected: true,
      width: "155px"
    },
    {
      key: 'Причина возврата',
      field: 'paymentRefundReasonName',
      type: TableFieldTypes.TEXT,
      filterType: 'text',
      mode: MatchMode.contains,
      isSelected: true,
      width: '155px'
    },
    {
      key: 'Описание',
      field: 'description',
      type: TableFieldTypes.TEXT,
      filterType: 'text',
      mode: MatchMode.contains,
      isSelected: true,
      width: '155px'
    },
    {
      key: 'Тип операции',
      field: 'serviceName',
      type: 'text',
      filterType: 'text',
      mode: MatchMode.contains,
      isSelected: true,
      width: '155px'
    },
    {
      key: 'Дата завершения',
      field: 'finishedAt',
      type: 'datetime',
      isFiltered: true,
      isSelected: true,
      width: '155px'
    },
  ];

  static readonly paymentProperties = [
    { label: 'Дата', key: 'createdAt', format: 'date' },
    { label: 'Сумма', key: 'amount' },
    { label: 'Комиссия', key: 'commissionAmount' },
  ]

  static readonly expandedPaymentProperties = [
    { label: 'Комиссия', key: 'commissionAmount' },
    { label: 'Номер', key: 'number' },
    { label: 'Кошелёк', key: 'userMsisdn' },
    { label: 'Клиент', key: 'userFullName' },
    { label: 'Тип кассы', key: 'posTypeName' },
    { label: 'Адрес', key: 'address' },
    { label: 'Кэш. от мерчанта', key: 'merchantCashbackAmount' },
    { label: 'К оплате', key: 'toPayAmount' },
    { label: 'Тип операции', key: 'serviceName' }
  ];

  static readonly dictionary: Record<string, string> = {
    [TableStatusEnum.COMPLETED]: 'completed',
    [TableStatusEnum.REJECTED]: 'rejected',
    [TableStatusEnum.NO_VERIFIED]: 'no-verified',
    [TableStatusEnum.IN_PROCESS]: 'in-process',
    [TableStatusEnum.RETURNED]: 'returned',
    [TableStatusEnum.UNKNOWN]: 'unknown',
    [TableStatusEnum.CANCELED]: 'cancel',
  };
}
