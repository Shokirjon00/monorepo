import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SelectTriggerDirective } from './select-trigger.directive';

@NgModule({
  imports: [CommonModule, SelectTriggerDirective],
  exports: [SelectTriggerDirective],
})
export class SelectTriggerModule {}
