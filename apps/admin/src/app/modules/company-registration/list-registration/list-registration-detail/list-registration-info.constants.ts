import { ITab } from '@eskhata/util';
import { ActionEnum } from '@eskhata/util';

export class ListRegistrationDetailConstants {

  static getHeaderTabs(id: string): ITab[] {
    return [
      {
        label: 'Информация',
        path: `/company-registration-applications/list-registration/detail/${id}/list-info`,
        permissionName: 'CompanyRegistrationApplicationDetail',
      },
      {
        label: 'История',
        path: `/company-registration-applications/list-registration/detail/${id}/list-history`,
        permissionName: 'CompanyRegistrationApplicationHistoryDictionary',
      },
    ]
  }

  static getActions(listRegistrationId: string): any  {
    return [
      {
        code: ActionEnum.DOR_DISPATCH,
        tooltipName: 'Отправка письмо ДОР-у',
        permissionName: 'CompanyRegistrationApplicationEmail'
      },
      {
        code: ActionEnum.GENERATING_AN_APPLICATION,
        tooltipName: 'Сгенерировать заявление',
        permissionName: 'CompanyRegistrationApplicationReport'
      },
      {
        code: ActionEnum.EDIT,
        path: `company-registration-applications/list-registration/edit/${listRegistrationId}`,
        tooltipName: 'Редактировать заявку',
        permissionName: 'CompanyRegistrationApplicationUpdate'
      },
      {
        code: ActionEnum.FILL_APPLICATION_FORM,
        path: `company_registration_applications/report/${listRegistrationId}`,
        tooltipName: "Сформировать заявление"
      }
    ]
  }
}
