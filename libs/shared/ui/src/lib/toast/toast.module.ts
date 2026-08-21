import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MessageService } from '@eskhata/data-access';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { ToastComponent } from './toast.component';
import { ToastItemComponent } from './toast-item/toast-item.component';

@NgModule({
  imports: [CommonModule, AngularSvgIconModule, ToastComponent, ToastItemComponent],
  exports: [CommonModule, ToastComponent, ToastItemComponent],
  providers: [MessageService],
})
export class ToastModule {}
