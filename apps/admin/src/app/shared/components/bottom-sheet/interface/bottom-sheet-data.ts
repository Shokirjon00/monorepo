export interface IBottomSheetData {
  dataSource: any[] | object;
  selected?: any[];
  canSearch?: boolean;
  path?: string;
  searchPlaceholder?: string;
  labelKey?: string;
  customFilters?: any;
  isMultiSelect?: boolean;
  currentValue?: any;
  filterType?: string;
  initialLoad?: any;
  initialData?: any;
}

export interface IDataSource {
  id: string;
  name: string;
  selected?: boolean;
}
