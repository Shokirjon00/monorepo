import { Directive, inject, Input, TemplateRef } from '@angular/core';

@Directive({
  selector: '[emPTemplate]',
})
export class PrimeTemplateDirective {

  @Input() type: string;

  @Input('emPTemplate') name: string;
  readonly template = inject(TemplateRef<any>);

  getType(): string {
    return this.name;
  }
}

export class PrimeTemplate {
}
