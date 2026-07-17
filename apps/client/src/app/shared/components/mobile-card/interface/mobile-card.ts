export interface IMobileCardField {
  label?: string;
  value?: string;
  key: string;
  field: string;
  type?: 'text' | 'number' | 'date' | 'datetime' | 'array' | 'status';
  colorField?: string;
  hideLabel?: boolean;
}
