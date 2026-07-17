import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastItemComponent } from '@shared/components/toast/toast-item/toast-item.component';
import { MessageService } from '@core/services/message.service';
import { AngularSvgIconModule } from 'angular-svg-icon';

@NgModule({
  imports: [
    CommonModule,
    AngularSvgIconModule,
    ToastItemComponent,
  ],
  exports: [
    CommonModule,
    ToastItemComponent
  ],
  providers: [MessageService]
})
export class ToastModule {}
