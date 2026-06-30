import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { ToastComponent } from '@shared-core/ui/toast/toast.component';
import { MessageService } from '@shared-core/data-access/message.service';
import { ToastItemComponent } from '@shared-core/ui/toast/toast-item/toast-item.component';

@NgModule({
  imports: [
    CommonModule,
    AngularSvgIconModule,
    ToastComponent,
    ToastItemComponent,
  ],
  exports: [ToastComponent],
  providers: [MessageService],
})
export class ToastModule {}
