import { Directive, TemplateRef, input, inject } from '@angular/core';

@Directive({
  selector: '[emPTemplate]',
})
export class PrimeTemplateDirective {

  readonly type = input<string>();

  readonly name = input<string>(undefined, { alias: "emPTemplate" });

  template = inject(TemplateRef);

  getType(): string {
    return this.name();
  }
}

export class PrimeTemplate {
}
