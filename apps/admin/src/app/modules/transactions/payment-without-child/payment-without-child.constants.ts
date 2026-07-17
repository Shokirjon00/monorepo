import { ActionEnum } from "@core/enums/action-enum";
import { IAction } from "@shared/components/actions/actions.interface";
import { ITab } from "@core/interfaces/header.interface";
import { ICaption } from "@core/interfaces";
import { MatchMode } from "@core/enums/match-mode.enum";
import { environment as env } from "@environments/environment";

export class PaymentsWithoutConstants {

  static readonly PAYMENT_WITHOUT_ACTIONS: IAction[] = [
    {
      code: ActionEnum.SYNC_PAYMENT,
      icon: './assets/icons/reload.svg',
      dialogName: 'sync-dialog',
      tooltipName: 'Синхронизация статуса',
      permissionName: 'PaymentContinueProcess'
    },
    {
      code: ActionEnum.EXPORT_QUEUE,
      tooltipName: 'Экспорт',
      path: 'payments/report/all',
      permissionName: 'PaymentWithChildsExportToExcel'
    },
  ]

  static readonly HEADER_TABS: ITab[] = [
    {
      label: 'Платежи',
      path: '/transactions/payments',
      permissionName: 'PaymentList',
    },
    {
      label: 'Все транзакции',
      path: '/transactions/payment-without-child',
      permissionName: 'PaymentAll'
    },
  ]

  static readonly PAYMENT_WITHOUT_CHILD_COLUMNS : ICaption[] = [
    {
      key: 'Галочки',
      field: '',
      type: 'select',
      filterType: 'text',
      isSelected: true,
      width: '60px'
    },
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
      key: 'ID платежа',
      field: 'id',
      type: 'text',
      filterType: 'text',
      isSelected: true,
      width: '155px',
    },
    {
      key: 'ID родительского платежа',
      field: 'parentId',
      type: 'text',
      filterType: 'text',
      isSelected: true,
      width: '155px',
    },
    {
      key: 'Организация',
      field: 'companyName',
      placeholder: 'Выберите организацию',
      filterParams: 'companyId',
      type: 'link',
      filterType: 'search-dropdown',
      apiUrl: `${env.api.companies}/${env.api.dictionary}`,
      isSelected: true,
    },
    {
      key: 'Точка',
      field: 'merchantName',
      type: 'text',
      placeholder: 'Выберите точку',
      filterParams: 'merchantId',
      apiUrl: `${env.api.merchants}/${env.api.dictionary}`,
      filterType: 'search-dropdown',
      isSelected: true,
      width: '155px'
    },
    {
      key: 'Касса',
      field: 'posName',
      type: 'text',
      placeholder: 'Выберите кассу',
      filterParams: 'posId',
      apiUrl: `${env.api.poses}/${env.api.dictionary}`,
      filterType: 'search-dropdown',
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
      key: 'Получатель',
      field: 'toAccountNumber',
      type: 'text',
      filterType: 'text',
      isSelected: true,
      width: '155px'
    },
    {
      key: 'Создан',
      field: 'createdAt',
      type: 'datetime',
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
      key: 'Завершён',
      field: 'finishedAt',
      type: 'datetime',
      filterType: 'date',
      isSelected: true,
    },
    {
      key: 'Сумма',
      field: 'amount',
      type: 'text',
      filterType: 'text',
      mode: MatchMode.equalsOnly,
      isSelected: true,
    },
    {
      key: 'Сервис',
      field: 'serviceName',
      type: 'text',
      filterType: 'text',
      isSelected: true,
    },
    {
      key: 'Номер документа',
      field: 'number',
      type: 'text',
      filterType: 'text',
      mode: MatchMode.equalsOnly,
      isSelected: true,
    },
    {
      key: 'Шлюз плательщика',
      field: 'fromGatewayName',
      type: 'text',
      filterType: 'text',
      isSelected: true,
    },
    {
      key: 'Шлюз получателя',
      field: 'toGatewayName',
      type: 'text',
      filterType: 'text',
      isSelected: true,
    },
    {
      key: 'Подробный статус',
      field: 'paymentStatusName',
      type: 'text',
      filterType: 'text',
      isSelected: true,
    },
    {
      key: 'Статус синхронизации',
      field: 'paymentSyncStatusName',
      type: 'text',
      filterType: 'text',
      isSelected: true,
    },
    {
      key: 'Статус ошибки',
      field: 'paymentStatusDetailName',
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

}
