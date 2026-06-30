import { ICaption } from "@core/interfaces/table.interface";

export interface IFilterItem extends ICaption {
  startDate: string;
  endDate: string;
  selectedValue?: SelectedValue;
}

interface SelectedValue {
  id: string | number;
  name: string;
}
