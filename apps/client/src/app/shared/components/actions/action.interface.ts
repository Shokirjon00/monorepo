export interface IAction {
  code?: string;
  name?: string;
  tooltipName?: string;
  path?: string;
  icon?: string;
  select?:IAction[];
  selected?: boolean;
  dialogName?: string;
  permissionName?: string;
  filterItem?: string;
}
