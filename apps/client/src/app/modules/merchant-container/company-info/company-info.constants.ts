import { IAction } from "@shared/components/actions/action.interface";
import { ActionEnum } from "@core/enums/action-enum";

export class CompanyInfoConstants {

  static readonly COMPANY_INFO_ACTION: IAction[] = [
    {
      code: ActionEnum.OPEN_DIALOG,
      dialogName: 'telegram-notification',
      icon: 'assets/icons/share.svg',
      tooltipName: 'Подключения телеграм',
      name: 'Подключения телеграм',
      permissionName: 'PosSendTelegramLink'
    },
  ]

  static readonly companyProperties = [
    { label: 'ID в АБС', key: 'extCodeAbs' },
    { label: 'ID в EQMS', key: 'extCodeEqms' },
    { label: 'Наименование', key: 'name' },
    { label: 'ИНН', key: 'inn' },
    { label: 'Форма собственности', key: 'companyLegalFormName' },
    { label: 'Сегмент', key: 'companySegmentName' },
    { label: 'Филиал', key: 'branchName' },
    { label: 'Регион', key: 'regionName' },
    { label: 'Район', key: 'areaName' },
    { label: 'Город', key: 'cityName' },
    { label: 'Адрес', key: 'address' },
    { label: 'Реферал', key: 'referName' },
    { label: 'Статус', key: 'statusName' }
  ];
}
