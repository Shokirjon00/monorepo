export interface IHeader {
  title?: string;
  tabs?: ITab[];
  isFilter?: boolean;
  tabShow?: boolean;
  paginationHide?: boolean;
}

export interface ITab {
  label: string;
  path: string;
  permissionName?: string;
  selected?: boolean;
  queryParams?: { [key: string]: any };
}
