import { ITab } from '@eskhata/util';
import { ICaption } from "@core/interfaces";
import { MatchMode } from "@core/enums/match-mode.enum";
import { IAction } from '@eskhata/util';
import { ActionEnum } from '@eskhata/util';

export class AdvancePaymentsPageConstants {

  static readonly HEADER_TABS: ITab[] = [
    {
      label: 'Авансовые выплаты',
      path: '/advance/advance-payments',
    },
    {
      label: 'Белый список',
      path: '/advance/allow-list',
      permissionName: 'AdvancePayoutOfferList'
    },
    {
      label: 'Авансовые комиссии',
      path: '/advance/advance-commissions',
      permissionName: 'CommissionAdvanceList'
    },
  ];

  static readonly ADVANCE_PAYMENTS_COLUMNS : ICaption[] = [
    {
      key: 'Статус',
      field: 'statusName',
      fieldSecond: 'statusName',
      type: 'indicator',
      filterType: 'text',
      isSelected: true,
    },
    {
      key: 'Организация',
      field: 'companyName',
      type: 'link',
      filterType: 'text',
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
      key: 'Задолженность',
      field: 'amountRemain',
      type: 'number',
      filterType: 'number',
      mode: MatchMode.equalsOnly,
      isSelected: true,
      width: '155px',
    },
    {
      key: 'Дата выдачи',
      field: 'issuedAt',
      type: 'date',
      filterType: 'date',
      isSelected: true,
      width: '100px',
    },
    {
      key: 'Срок погашения',
      field: 'expiredAt',
      type: 'datetime',
      filterType: 'date',
      isSelected: true,
      width: '170px',
    },
    {
      key: 'Дата погашения',
      field: 'repaymentAt',
      type: 'datetime',
      filterType: 'date',
      isSelected: true,
    },
    {
      key: 'Дней просрочено',
      field: 'expiredDays',
      type: 'number',
      filterType: 'number',
      isSelected: true,
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
  ];


  static readonly ADVANCE_ACTIONS: IAction[] = [
    {
      code: ActionEnum.EXPORT,
      tooltipName: 'Экспорт',
      path: 'advance_payouts/report',
      permissionName: 'AdvancePayoutExportToExcel'
    }
  ];
}
