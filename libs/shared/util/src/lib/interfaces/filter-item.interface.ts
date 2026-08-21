import { ICaption } from './table.interface';

export interface IFilterItem extends ICaption {
  startDate: string;
  endDate: string;
  selectedValue?: ISelectedValue;
}

export interface ISelectedValue {
  id: string | number;
  name: string;
}
