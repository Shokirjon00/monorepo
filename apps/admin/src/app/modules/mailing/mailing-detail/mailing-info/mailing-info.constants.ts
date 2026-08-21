import { ActionEnum } from '@eskhata/util';

export class MailingInfoConstants {

  static getActions (mailingId: string): any {
    return [
      {
        code: ActionEnum.EDIT,
        tooltipName: 'Редактировать',
        path: `/mailing/${mailingId}/edit`,
        permissionName: 'MailingUpdate'
      },
    ]
  }
}
