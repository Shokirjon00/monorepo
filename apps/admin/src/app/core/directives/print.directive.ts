import {Directive, HostListener, Input} from '@angular/core';

@Directive({
  standalone: true,
  selector: '[emPrint]'
})
export class PrintDirective {
  @Input() previewOnly: boolean = false;
  @Input() printSectionId: string;
  @Input() printTitle: string;
  @Input() useExistingCss = false;
  @Input() printDelay: number = 0;
  public _printStyle: any = [];
  private _styleSheetFile = '';

  @Input()
  set printStyle(values: { [key: string]: { [key: string]: string } }) {
    for (const key in values) {
      if (values.hasOwnProperty(key)) {
        this._printStyle.push((key + JSON.stringify(values[key])).replace(/['"]+/g, ''));
      }
    }
    this.returnStyleValues();
  }

  @Input()
  set styleSheetFile(cssList: string) {
    const linkTagFn = function (cssFileName: any): any {
      return `<link rel="stylesheet" type="text/css" href="${cssFileName}">`;
    }
    if (cssList.indexOf(',') !== -1) {
      const valueArr = cssList.split(',');
      for (const val of valueArr) {
        this._styleSheetFile = this._styleSheetFile + linkTagFn(val);
      }
    } else {
      this._styleSheetFile = linkTagFn(cssList);
    }
  }

  @HostListener('click')
  public print(): void {
    let styles = '', links = '';
    const baseTag = this.getElementTag('base');

    if (this.useExistingCss) {
      styles = this.getElementTag('style');
      links = this.getElementTag('link');
    }

    const printContents = this.getHtmlContents();
    const popupWin = window.open('', '_blank', 'top=0,left=0,height=auto,width=auto');
    popupWin.document.open();
    popupWin.document.write(`
      <html>
        <head>
          <title>${this.printTitle ? this.printTitle : ''}</title>
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
              ${this.previewOnly ? '' : `setTimeout(function() {
                closeWindow(window.print());
              }, ${this.printDelay});`}
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

  public returnStyleValues(): any {
    return `<style> ${this._printStyle.join(' ').replace(/,/g, ';')} </style>`;
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
    const printContents = document.getElementById(this.printSectionId);
    if (!printContents) return null;

    const inputEls = printContents.getElementsByTagName('input');
    const selectEls = printContents.getElementsByTagName('select');
    const textAreaEls = printContents.getElementsByTagName('textarea');

    this.updateInputDefaults(inputEls);
    this.updateSelectDefaults(selectEls);
    this.updateTextAreaDefaults(textAreaEls);

    return printContents.innerHTML;
  }

}
