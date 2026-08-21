import { ICaption } from './table.interface';

export interface IFilterItem extends ICaption {
  startDate: string;
  endDate: string;
  /** Admin-only before the merge: pre-selected option carried alongside the filter. */
  selectedValue?: ISelectedValue;
}

export interface ISelectedValue {
  id: string | number;
  name: string;
}
