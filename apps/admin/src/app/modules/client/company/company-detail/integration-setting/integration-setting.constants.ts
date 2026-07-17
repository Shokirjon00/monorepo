import { IAction } from "@shared/components/actions/actions.interface";
import { ActionEnum } from "@core/enums/action-enum";

export class IntegrationSettingsConstants {

  static readonly INTEGRATION_ACTION: IAction[] = [
    {
      code: ActionEnum.OPEN_DIALOG,
      icon: '/assets/icons/save.svg',
      dialogName: 'integration-setting-save',
      tooltipName: 'Сохранить настройки',
      name: 'Сохранить',
      permissionName: 'CompanyIntegrationConfigurationUpdate'
    },
  ]
}
