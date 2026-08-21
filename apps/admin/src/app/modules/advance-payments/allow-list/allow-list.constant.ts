import { IAction } from '@eskhata/util';
import { ActionEnum } from '@eskhata/util';
import { ICaption, IRowAction } from "@core/interfaces";
import { TableRowActionEnum } from '@eskhata/util';
import { MatchMode } from "@core/enums/match-mode.enum";

export class AllowListConstant {

  static readonly ALLOW_LIST_ACTION: IAction[] = [
    {
      code: ActionEnum.ADD,
      tooltipName: 'Добавить',
      path: '/advance/allow-list/new',
      permissionName: 'AdvancePayoutOfferCreate'
    },
    {
      code: ActionEnum.EXPORT,
      path: 'advance_payout_offers/report',
      tooltipName: 'Экспорт',
      permissionName: 'AdvancePayoutOfferExportToExcel'
    },
  ];

  static readonly ALLOW_LIST_COLUMNS : ICaption[] = [
    {
      key: 'Статус',
      field: 'isActive',
      type: 'status-indicator',
      filterType: 'text',
      isFiltered: true,
      isSelected: true,
      width: '155px',
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
      key: 'Одобренный лимит',
      field: 'amount',
      type: 'text',
      filterType: 'text',
      isSelected: true,
      mode: MatchMode.equalsOnly,
      width: '100px',
    },
    {
      key: 'Дата создания',
      field: 'createdAt',
      type: 'date',
      filterType: 'date',
      isSelected: true,
      width: '100px',
    },
    {
      key: 'Дата изменение',
      field: 'modifiedAt',
      type: 'date',
      filterType: 'date',
      isSelected: true,
    },
    {
      key: 'Пользователь',
      field: 'createdByName',
      type: 'text',
      filterType: 'text',
      isSelected: true,
    },
  ]

  static readonly TABLE_ACTIONS: IRowAction[] = [
    {
      type: TableRowActionEnum.EDIT,
      permissionName: 'AdvancePayoutOfferUpdate',
      iconUrl: 'icons/pen.svg',
    }
  ]
}
