import {Directive, TemplateRef, input} from "@angular/core";

@Directive({
  selector: '[emPTemplate]',
})
export class PrimeTemplateDirective {

  readonly type = input<string>();

  readonly name = input<string>(undefined, { alias: "emPTemplate" });

  constructor(public template: TemplateRef<any>) {
  }

  getType(): any {
    return this.name();
  }
}

export class PrimeTemplate {
}
