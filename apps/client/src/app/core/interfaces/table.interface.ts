export interface ITable {
  caption?: ICaption[];
  data?: any;
}

export interface ICaption {
  key?: string;
  index?: number;
  field: string;
  fieldSecond?: string;
  fieldThird?: string;
  type?: string;
  isSelected?: boolean;
  value?: string;
  width?: string;
  isSortable?: boolean;
  isFiltered?: boolean;
  filterType?: string;
  mode?: string;
  permissionName?: string;
  endDate?: string;
}

export interface IRowAction {
  type: string,
  permissionName: string;
  iconUrl: string;
  text?: string;
  defaultValue?: any;
}

export interface IOptionAction {
  type: string,
  permissionName: string;
  text?: string;
}
