declare module 'jsoneditor' {
  export interface JSONEditorOptions {
    mode?: 'tree' | 'view' | 'form' | 'code' | 'text';
    modes?: Array<'tree' | 'view' | 'form' | 'code' | 'text'>;
    mainMenuBar?: boolean;
    navigationBar?: boolean;
    statusBar?: boolean;
    onChange?: () => void;
    onChangeJSON?: (json: any) => void;
    onError?: (error: Error) => void;
    readOnly?: boolean;
  }

  export default class JSONEditor {
    constructor(container: HTMLElement, options?: JSONEditorOptions, json?: any);

    set(json: any): void;
    get(): any;
    update(json: any): void;
    destroy(): void;
  }
}
