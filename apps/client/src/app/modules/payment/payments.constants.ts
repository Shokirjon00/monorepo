import { MatchMode } from "@core/enums/match-mode.enum";
import { TableFieldTypes, TableRowActionEnum } from '@eskhata/util';
import { ActionEnum } from '@eskhata/util';
import { TableStatusEnum } from '@eskhata/util';
import { ICaption } from '@eskhata/util';

export class PaymentsConstants {
  static readonly PAYMENTS_COLUMNS: ICaption[] = [
    {
      key: 'Статус',
      field: 'paymentStatusGroupId',
      fieldSecond: 'paymentStatusGroupName',
      type: 'indicator',
      isFiltered: true,
      filterType: 'text',
      isSelected: true,
      width: '155px',
    },
    {
      key: 'Дата',
      field: 'createdAt',
      type: 'datetime',
      isFiltered: true,
      filterType: 'date',
      mode: MatchMode.equalsOnly,
      isSelected: true,
      width: '155px',
    },
    {
      key: 'Дата завершения',
      field: 'finishedAt',
      type: 'datetime',
      isFiltered: true,
      isSelected: true,
      width: '155px',
    },
    {
      key: 'Номер',
      field: 'number',
      type: 'number',
      filterType: 'number',
      mode: MatchMode.equalsOnly,
      isSelected: true,
      width: '155px',
    },
    {
      key: 'Точка',
      field: 'merchantName',
      type: 'text',
      filterType: 'text',
      isFiltered: true,
      isSelected: true,
      width: '155px',
    },
    {
      key: 'Касса',
      field: 'posName',
      type: 'text',
      filterType: 'text',
      isFiltered: true,
      isSelected: true,
      width: '155px',
    },
    {
      key: 'Сумма',
      field: 'amount',
      type: 'number',
      filterType: 'number',
      mode: MatchMode.equalsOnly,
      isSelected: true,
      width: '155px',
    },
    {
      key: 'Валюта',
      field: 'fromCurrencyIso',
      type: 'text',
      filterType: 'text',
      isFiltered: true,
      isSelected: true,
      width: '155px',
    },
    {
      key: 'Комиссия',
      field: 'commissionAmount',
      type: 'number',
      filterType: 'text',
      mode: MatchMode.equalsOnly,
      isSelected: true,
      width: '155px',
    },
    {
      key: 'Информация',
      field: 'params',
      type: 'list',
      filterType: 'text',
      isSelected: true,
      isSortable: true,
      width: '155px',
    },
    {
      key: 'Банк Эмитент',
      field: 'bankEmitentName',
      type: 'text',
      filterType: 'text',
      mode: MatchMode.contains,
      isSelected: true,
      width: '155px',
    },
    {
      key: ' Плательщик',
      field: 'payer',
      type: 'text',
      filterType: 'text',
      isSortable: true,
      isSelected: true,
      width: '155px',
    },

    {
      key: 'Клиент',
      field: 'userFullName',
      type: 'text',
      filterType: 'text',
      mode: MatchMode.contains,
      isSelected: true,
      width: '155px',
    },
    {
      key: 'Тип кассы',
      field: 'posTypeName',
      type: 'text',
      filterType: 'text',
      isFiltered: true,
      isSelected: true,
      width: '155px',
    },
    {
      key: 'Адрес',
      field: 'address',
      type: 'text',
      filterType: 'text',
      mode: MatchMode.contains,
      isSelected: true,
      width: '155px',
    },
    {
      key: 'Кэш. от мерчанта',
      field: 'merchantCashbackAmount',
      type: 'number',
      filterType: 'text',
      mode: MatchMode.equalsOnly,
      isSelected: true,
      width: '155px',
    },
    {
      key: 'К оплате',
      field: 'toPayAmount',
      type: 'number',
      filterType: 'number',
      mode: MatchMode.equalsOnly,
      isSelected: true,
      width: '155px',
    },
    {
      key: 'Причина возврата',
      field: 'paymentRefundReasonName',
      type: TableFieldTypes.TEXT,
      filterType: 'text',
      mode: MatchMode.contains,
      isSelected: true,
      width: '155px',
    },
    {
      key: 'Описание',
      field: 'description',
      type: TableFieldTypes.TEXT,
      filterType: 'text',
      mode: MatchMode.contains,
      isSelected: true,
      width: '155px',
    },
    {
      key: 'Тип операции',
      field: 'serviceName',
      type: 'text',
      filterType: 'text',
      mode: MatchMode.contains,
      isSelected: true,
      width: '155px',
    },
    {
      key: 'Подробный статус ошибки',
      field: 'paymentStatusDetailName',
      type: 'text',
      filterType: 'text',
      isSelected: true,
      width: '155px',
    },
  ];

  static readonly ACTIONS = [
    {
      code: ActionEnum.EXPORT,
      tooltipName: 'Экспорт',
      path: 'payments/report',
      name: 'Экспорт',
      permissionName: 'PaymentExportToExcel',
    },
    {
      code: ActionEnum.REFRESH,
      tooltipName: 'Обновить таблицу',
      name: 'Обновить',
    },
  ];

  static readonly TABLE_ACTIONS = [
    {
      type: TableRowActionEnum.REFUND,
      permissionName: 'PaymentCancel',
      iconUrl: 'icons/revert.svg',
    },
    {
      type: TableRowActionEnum.PRINT,
      permissionName: 'PaymentPrintReceipt',
      iconUrl: 'icons/print.svg',
    },
  ];

  static readonly PAYMENT_FILTER_MODE: {field: string, mode: MatchMode}[] = [
    {
      field: 'merchantId',
      mode: MatchMode.equalsOnly,
    },
    {
      field: 'posId',
      mode: MatchMode.equalsOnly,
    },
    {
      field: 'amount',
      mode: MatchMode.greaterThanOrEqual,
    },
  ];

  static readonly PAYMENT_STATUS_GROUP = [
    { name: 'Все', value: '' },
    { name: 'Не подтвержден', value: '4aa6ab6e-669f-4b25-a79d-edad8a865296' },
    { name: 'В обработке', value: 'e3f29ae4-05c0-4868-85a4-b0399b4e29d6' },
    { name: 'Исполнено', value: '5419a575-1c42-475e-90bc-5e16767ec806' },
    { name: 'Отказано', value: '434a4d68-cf35-4adc-8d9a-d26dcdcdf87a' },
    { name: 'Отменено', value: '5a7eb022-be48-4b9d-a032-d23de35239cd' },
    { name: 'Возвращено', value: '5d9121ed-f1a4-4a47-9ae7-26735e942468' },
    { name: 'Неизвестно', value: '54bc215d-b18b-4a57-aaaf-a506984ceca3' },
  ];

  static readonly NON_SIMPLE_FILTER_KEYS = [
    'posTypeId',
    'posId',
    'paymentStatusGroupId',
    'page',
    'filters',
    'pageSize',
    'startDate',
    'endDate',
  ];

  static readonly EXCLUDED_QUERY_PARAMS = ['merchantId', 'startedAt'];

  static readonly DICTIONARY: Record<string, string> = {
    [TableStatusEnum.COMPLETED]: 'completed',
    [TableStatusEnum.REJECTED]: 'rejected',
    [TableStatusEnum.NO_VERIFIED]: 'no-verified',
    [TableStatusEnum.IN_PROCESS]: 'in-process',
    [TableStatusEnum.RETURNED]: 'returned',
    [TableStatusEnum.UNKNOWN]: 'unknown',
    [TableStatusEnum.CANCELED]: 'cancel',
  };
}
