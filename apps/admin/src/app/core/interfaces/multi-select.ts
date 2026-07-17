export interface IMultiSelect {
  idField?: string;
  textField?: string;
  disabledField?: string;
}

export class ListItem {
  id: string | number;
  text: string | number;
  isDisabled?: boolean;

  public constructor(source: any) {
    if (source) {
      this.id = source.id;
      this.text = source.text;
      this.isDisabled = source.isDisabled;
    }
  }
}
