import { ICaption, IRowAction } from "@core/interfaces";
import { TableRowActionEnum } from '@eskhata/util';
import { IAction } from '@eskhata/util';
import { ActionEnum } from '@eskhata/util';
import { MatchMode } from "@core/enums/match-mode.enum";

export class CompanySegmentConstants {

  static readonly COMPANYSEGMENT_COLUMNS : ICaption[] = [
    {
      key: 'Статус',
      field: 'isActive',
      type: 'status-indicator',
      filterType: 'list',
      mode: MatchMode.equalsOnly,
      isFiltered: false,
      isSelected: true,
      width: '155px',
    },
    {
      key: 'Наименование',
      field: 'name',
      type: 'text',
      filterType: 'text',
      isSelected: true,
      width: '200px',
    },
    {
      key: 'Код ABS',
      field: 'extCodeAbs',
      type: 'text',
      filterType: 'text',
      isSelected: true,
      width: '200px',
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
  ]

  static readonly TABLE_ACTIONS: IRowAction[] = [
    {
      type: TableRowActionEnum.EDIT,
      permissionName: 'CompanySegmentUpdate',
      iconUrl: 'icons/pen.svg',
    }
  ]

  static readonly COMPANY_SEGMENT_ACTIONS: IAction[] = [
    {
      code: ActionEnum.ADD,
      tooltipName: 'Добавить сегмент',
      path: 'directory/company-segment/new',
      permissionName: 'CompanySegmentCreate'
    }
  ];
}
