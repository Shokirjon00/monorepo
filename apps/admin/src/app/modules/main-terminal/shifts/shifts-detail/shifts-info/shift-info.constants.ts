import { ICaption } from "@core/interfaces";
import { MatchMode } from "@core/enums/match-mode.enum";
import { environment as env } from "@environments/environment";

export class ShiftInfoConstants {

  static readonly SHIFT_INFO_COLUMNS: ICaption[] = [
    {
      key: 'Статус',
      field: 'paymentStatusGroupId',
      fieldSecond: 'paymentStatusGroupName',
      type: 'indicator',
      filterType: 'dropdown',
      apiUrl: `${env.api.paymentStatusGroups}`,
      isSelected: true,
      width: '155px'
    },
    {
      key: 'ИНН',
      field: 'inn',
      type: 'text',
      filterType: 'text',
      isSelected: true,
      width: '100px',
    },
    {
      key: 'EQMS кассы',
      field: 'posExtCodeEqms',
      type: 'text',
      filterType: 'text',
      mode: MatchMode.equalsOnly,
      isSelected: true,
      width: '155px'
    },
    {
      key: 'Сумма оплаты',
      field: 'fromAmount',
      type: 'number',
      filterType: 'number',
      mode: MatchMode.equalsOnly,
      isSelected: true,
      width: '155px'
    },
    {
      key: 'Сумма пополнения',
      field: 'toAmount',
      type: 'number',
      filterType: 'number',
      mode: MatchMode.equalsOnly,
      isSelected: true,
      width: '155px'
    },
    {
      key: 'Создан',
      field: 'createdAt',
      type: 'datetime',
      filterType: 'date',
      mode: MatchMode.equalsOnly,
      isSelected: true,
      width: '155px'
    },
    {
      key: 'Создал',
      field: 'createdByName',
      type: 'text',
      filterType: 'text',
      isSelected: true,
    },
    {
      key: 'Завершен',
      field: 'finishedAt',
      type: 'datetime',
      filterType: 'date',
      mode: MatchMode.equalsOnly,
      isSelected: true,
      width: '155px'
    },
    {
      key: 'Плательщик',
      field: 'fromAccountNumber',
      type: 'text',
      filterType: 'text',
      isSelected: true,
      width: '155px'
    },
    {
      key: 'Тип операции',
      field: 'serviceName',
      type: 'text',
      placeholder: 'Выберите тип операции',
      filterParams: 'serviceId',
      apiUrl: `${env.api.services}/${env.api.dictionary}`,
      filterType: 'search-dropdown',
      isSelected: true,
      width: '155px'
    },
    {
      key: 'Банк эмитент',
      field: 'bankEmitentName',
      type: 'text',
      placeholder: 'Выберите банк эмитента',
      filterParams: 'bankEmitentId',
      apiUrl: `${env.api.banks}/${env.api.dictionary}`,
      filterType: 'search-dropdown',
      isSelected: true,
      width: '155px'
    },
    {
      key: 'Банк эквайер',
      field: 'bankAcquirerName',
      placeholder: 'Выберите банк эквайера',
      filterParams: 'bankAcquirerId',
      apiUrl: `${env.api.banks}/${env.api.dictionary}`,
      filterType: 'search-dropdown',
      type: 'text',
      isSelected: true,
      width: '155px'
    },
    {
      key: 'ID',
      field: 'id',
      type: 'text',
      filterType: 'text',
      isSelected: true,
      width: '155px'
    },
    {
      key: 'Номер документа',
      field: 'number',
      type: 'number',
      filterType: 'text',
      mode: MatchMode.equalsOnly,
      isSelected: true,
      width: '155px'
    },
    {
      key: 'Информация',
      field: 'params',
      type: 'text',
      filterType: 'text',
      isFiltered: true,
      mode: MatchMode.equalsOnly,
      isSelected: true,
      isSortable: true,
      width: '155px'
    },
    {
      key: 'Внешний ID',
      field: 'sessionNumber',
      type: 'text',
      filterType: 'text',
      mode: MatchMode.contains,
      isSelected: true,
      width: '155px'
    },
    {
      key: 'Номер кошелька',
      field: 'userMsisdn',
      type: 'text',
      filterType: 'text',
      mode: MatchMode.equalsOnly,
      isSelected: true,
      width: '155px'
    },
    {
      key: 'Получатель',
      field: 'toAccountNumber',
      type: 'text',
      filterType: 'text',
      isSelected: true,
      width: '155px'
    },
    {
      key: 'Шлюз плательщика',
      field: 'fromGatewayName',
      type: 'text',
      placeholder: 'Выберите шлюз плательщика',
      filterParams: 'fromGatewayId',
      apiUrl: `${env.api.gateways}/${env.api.dictionary}`,
      filterType: 'search-dropdown',
      isSelected: true,
      width: '155px'
    },
    {
      key: 'Шлюз получателя',
      field: 'toGatewayName',
      type: 'text',
      placeholder: 'Выберите шлюз получателя',
      filterParams: 'toGatewayId',
      apiUrl: `${env.api.gateways}/${env.api.dictionary}`,
      filterType: 'search-dropdown',
      isSelected: true,
      width: '155px'
    },
    {
      key: 'Подробный статус',
      field: 'paymentStatusName',
      type: 'text',
      placeholder: 'Выберите подробный статус',
      filterParams: 'paymentStatusId',
      apiUrl: `${env.api.paymentStatuses}/${env.api.dictionary}`,
      filterType: 'search-dropdown',
      isSelected: true,
      width: '155px'
    },
    {
      key: 'Статус синхронизации',
      field: 'paymentSyncStatusName',
      type: 'text',
      placeholder: 'Выберите статус синхронизации',
      filterParams: 'paymentSyncStatusId',
      apiUrl: `${env.api.paymentSyncStatuses}/${env.api.dictionary}`,
      filterType: 'search-dropdown',
      isSelected: true,
      width: '155px'
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
    }];

}
