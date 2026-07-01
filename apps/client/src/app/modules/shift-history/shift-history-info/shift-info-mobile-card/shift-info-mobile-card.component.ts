import { Component, Input, output, signal } from '@angular/core';
import { IPayment } from '@modules/payment/interfaces/payment.interface';
import { SharedModule } from '@shared/shared.module';
import { DatePipe } from '@angular/common';
import { SvgIconComponent } from 'angular-svg-icon';
import { EXPAND_DETAIL } from '@eskhata/util';

@Component({
  selector: 'em-shift-info-mobile-card',
  standalone: true,
  imports: [SharedModule, DatePipe, SvgIconComponent],
  templateUrl: './shift-info-mobile-card.component.html',
  styleUrl: './shift-info-mobile-card.component.scss',
  animations: [EXPAND_DETAIL],
})
export class ShiftInfoMobileCardComponent {
  @Input() loading = signal(false);
  @Input() paymentProperties: any[] = [];
  @Input() payment: IPayment;
  @Input() expandedPaymentProperties: any[] = [];
  @Input() statusLabel: string = '';

  readonly toggleClicked = output<IPayment>()

  toggle(payment: IPayment): void {
    this.toggleClicked.emit(payment);
  }
}
