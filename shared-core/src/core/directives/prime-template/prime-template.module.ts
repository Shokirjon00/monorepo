import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import { PrimeTemplateDirective } from '@core/directives/prime-template/prime-template';

@NgModule({
  declarations: [PrimeTemplateDirective],
  imports: [
    CommonModule
  ],
  exports: [PrimeTemplateDirective],
})
export class PrimeTemplateModule {
}
