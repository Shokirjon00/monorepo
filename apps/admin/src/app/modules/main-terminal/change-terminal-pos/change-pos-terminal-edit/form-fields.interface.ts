export interface IInfoRow {
  key: string;
  value: string | null | undefined;
  isDate?: boolean;
}

export interface IDateField {
  control: string;
  label: string;
}

export interface ITextField {
  control: string;
  label: string;
  placeholder: string;
}
