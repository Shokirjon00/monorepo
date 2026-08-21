import { Directive, TemplateRef, inject, input } from '@angular/core';

@Directive({
  selector: '[emPTemplate]',
})
export class PrimeTemplateDirective {
  readonly type = input<string>();

  readonly name = input<string>(undefined, { alias: 'emPTemplate' });

  template = inject(TemplateRef);

  getType(): string {
    return this.name();
  }
}

/**
 * @deprecated Legacy empty class carried over from both apps. Admin's toast still
 * queries it via `contentChildren(PrimeTemplate)`, which can never match because
 * this is not a directive — that query has always returned an empty list. It is
 * re-exported here only to keep the extraction behaviour-neutral; switching those
 * call sites to {@link PrimeTemplateDirective} is a separate, behaviour-changing fix.
 */
export class PrimeTemplate {}
