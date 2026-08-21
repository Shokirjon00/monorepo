import { ICaption } from '@eskhata/util';

export interface IFilterItem extends ICaption {
  startDate: string;
  endDate: string;
  selectedValue?: SelectedValue;
}

interface SelectedValue {
  id: string | number;
  name: string;
}
