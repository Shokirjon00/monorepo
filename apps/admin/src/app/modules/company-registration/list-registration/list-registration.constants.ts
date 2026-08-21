import { ICaption, IRowAction } from "@core/interfaces";
import { MatchMode } from "@core/enums/match-mode.enum";
import { TableRowActionEnum } from '@eskhata/util';

export class ListRegistrationConstants {

  static readonly TABLE_ACTIONS: IRowAction[] = [
    {
      type: TableRowActionEnum.EDIT,
      permissionName: 'CompanyRegistrationApplicationUpdate',
      iconUrl: 'icons/pen.svg',
    }
  ];

  static readonly LIST_REGISTRATION_COLUMNS : ICaption[] = [
    {
      key: 'Статус',
      field: 'companyRegistrationApplicationStatusName',
      type: 'text',
      filterType: 'text',
      isSelected: true,
      isSortable: true,
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
      key: 'Дата подачи',
      field: 'createdAt',
      type: 'date',
      filterType: 'date',
      isSelected: true,
      width: '170px',
    },
    {
      key: 'Название организации',
      field: 'companyName',
      type: 'text',
      filterType: 'text',
      isSelected: true,
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
      key: 'Тип эквайринга',
      field: 'posTypeNames',
      type: 'text',
      filterType: 'text',
      isSelected: true,
      isFiltered: true,
      isSortable: true,
      width: '100px',
    },
    {
      key: 'ФИО заявителя',
      field: 'applicantFullName',
      type: 'text',
      filterType: 'text',
      isSelected: true,
    },
    {
      key: 'Номер телефона',
      field: 'applicantPhoneNumber',
      type: 'text',
      filterType: 'text',
      isSelected: true,
    },
  ]
}

