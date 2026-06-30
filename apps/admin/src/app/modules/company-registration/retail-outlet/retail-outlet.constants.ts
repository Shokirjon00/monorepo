import { ICaption, IRowAction } from "@core/interfaces";
import { MatchMode } from "@core/enums/match-mode.enum";
import { TableRowActionEnum } from "@core/enums/table";
import {RETAIL_OUTING} from "@modules/company-registration/retail-outlet/retail-outlet.routing";
import {IAction} from "@shared/components/actions/actions.interface";
import {ActionEnum} from "@core/enums/action-enum";

export class RetailOutletConstants {

  static readonly TABLE_ACTIONS: IRowAction[] = [
    {
      type: TableRowActionEnum.EDIT,
      permissionName: 'CompanyRegistrationApplicationUpdate',
      iconUrl: 'icons/pen.svg',
    }
  ];

  static readonly RETAIL_OUTING_COLUMNS : ICaption[] = [
    {
      key: 'Статус',
      field: 'merchantApplicationStatusName',
      type: 'text',
      filterType: 'text',
      isSortable: true,
      isSelected: true,
    },
    {
      key: '№ заявки',
      field: 'number',
      type: 'text',
      mode: MatchMode.equalsOnly,
      filterType: 'text',
      isSelected: true,
    },
    {
      key: 'Название организации',
      field: 'companyName',
      type: 'text',
      filterType: 'text',
      isSelected: true,
    },
    {
      key: 'Название торговой точки',
      field: 'name',
      type: 'text',
      filterType: 'text',
      isSelected: true,
    },
    {
      key: 'Номер владельца',
      field: 'managerPhoneNumber',
      type: 'text',
      filterType: 'text',
      isSelected: true,
      width: '100px',
    },
    {
      key: 'Создано',
      field: 'createdAt',
      type: 'date',
      filterType: 'date',
      isSelected: true,
    },
  ]
}

