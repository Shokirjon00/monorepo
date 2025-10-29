export interface ITable {
  caption?: ICaption[];
  data?: any;
}

/**
 *  @TODO: create own interface for filter fields and remove ICaption
 * @Deprecated
 */
export interface ICaption {
  key: string;
  index?: number;
  field?: string;
  fieldSecond?: string;
  filterParams?: string;
  placeholder?: string;
  fieldThird?: string;
  type: string;
  isSelected?: boolean;
  value?: string;
  width?: string;
  isSortable?: boolean;
  isFiltered?: boolean;
  filterType?: string;
  mode?: string;
  permissionName?: string;
  startDate?: string;
  endDate?: string;
  runAt?: string;
  finishAt?: string;
  apiUrl?: string;
}

// TODO: create IFilterField and ITableColumn
interface IColumn {
  key: string;
  field: string;
  type: string;
}

export interface IFilterField extends IColumn {
  filterType?: string;
  mode?: string;
  value?: string;
  endDate?: string;
  startDate?: string;
}

export interface IRowAction {
  type: string,
  permissionName: string;
  iconUrl?: string;
  text?: string;
  defaultValue?: any;
}

export interface IOptionAction {
  type: string,
  key?: string,
  permissionName: string;
  optionName?: string;
}
