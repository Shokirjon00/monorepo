import {Directive, HostListener, Input, input} from '@angular/core';

@Directive({
  standalone: true,
  selector: '[emPrint]'
})
export class PrintDirective {

  public _printStyle: any = [];

  readonly previewOnly = input<boolean>(false);

  readonly printSectionId = input<string>();

  readonly printTitle = input<string>();

  readonly useExistingCss = input(false);

  readonly printDelay = input<number>(0);

  @Input()
  set printStyle(values: { [key: string]: { [key: string]: string } }) {
    for (let key in values) {
      if (values.hasOwnProperty(key)) {
        this._printStyle.push((key + JSON.stringify(values[key])).replace(/['"]+/g, ''));
      }
    }
    this.returnStyleValues();
  }

  public returnStyleValues(): any {
    return `<style> ${this._printStyle.join(' ').replace(/,/g,';')} </style>`;
  }

  private _styleSheetFile = '';

  @Input()
  set styleSheetFile(cssList: string) {
    let linkTagFn = function(cssFileName: any): any {
      return `<link rel="stylesheet" type="text/css" href="${cssFileName}">`;
    }
    if (cssList.indexOf(',') !== -1) {
      const valueArr = cssList.split(',');
      for (let val of valueArr) {
        this._styleSheetFile = this._styleSheetFile + linkTagFn(val);
      }
    } else {
      this._styleSheetFile = linkTagFn(cssList);
    }
  }

  private returnStyleSheetLinkTags(): any {
    return this._styleSheetFile;
  }
  private getElementTag(tag: keyof HTMLElementTagNameMap): string {
    const html: string[] = [];
    const elements = document.getElementsByTagName(tag);
    for (let index = 0; index < elements.length; index++) {
      html.push(elements[index].outerHTML);
    }
    return html.join('\r\n');
  }

  private updateInputDefaults(elements: HTMLCollectionOf<HTMLInputElement>): void {
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];
      element['defaultValue'] = element.value;
      if (element['checked']) element['defaultChecked'] = true;
    }
  }
  private updateSelectDefaults(elements: HTMLCollectionOf<HTMLSelectElement>): void {
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];
      const selectedIdx = element.selectedIndex;
      const selectedOption: HTMLOptionElement = element.options[selectedIdx];

      selectedOption.defaultSelected = true;
    }
  }
  private updateTextAreaDefaults(elements: HTMLCollectionOf<HTMLTextAreaElement>): void {
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];
      element['defaultValue'] = element.value;
    }
  }

  private getHtmlContents(): string | null {
    const printContents = document.getElementById(this.printSectionId());
    if (!printContents) return null;

    const inputEls = printContents.getElementsByTagName('input');
    const selectEls = printContents.getElementsByTagName('select');
    const textAreaEls = printContents.getElementsByTagName('textarea');

    this.updateInputDefaults(inputEls);
    this.updateSelectDefaults(selectEls);
    this.updateTextAreaDefaults(textAreaEls);

    return printContents.innerHTML;
  }

  @HostListener('click')
  public print(): void {
    let printContents, popupWin, styles = '', links = '';
    const baseTag = this.getElementTag('base');

    if(this.useExistingCss()) {
      styles = this.getElementTag('style');
      links = this.getElementTag('link');
    }

    printContents = this.getHtmlContents();
    popupWin = window.open("", "_blank", "top=0,left=0,height=auto,width=auto");
    popupWin.document.open();
    const printTitle = this.printTitle();
    popupWin.document.write(`
      <html>
        <head>
          <title>${printTitle ? printTitle : ""}</title>
          ${baseTag}
          ${this.returnStyleValues()}
          ${this.returnStyleSheetLinkTags()}
          ${styles}
          ${links}
        </head>
        <body>
          ${printContents}
          <script defer>
            function triggerPrint(event) {
              window.removeEventListener('load', triggerPrint, false);
              ${this.previewOnly() ? '' : `setTimeout(function() {
                closeWindow(window.print());
              }, ${this.printDelay()});`}
            }
            function closeWindow(){
                window.close();
            }
            window.addEventListener('load', triggerPrint, false);
          </script>
        </body>
      </html>`);
    popupWin.document.close();
  }
}
