import { Component, Input, output } from '@angular/core';
import { NgxPermissionsModule } from 'ngx-permissions';
import { SvgIconComponent } from 'angular-svg-icon';
import { IPaymentRefundApplications } from '@core/interfaces/payments-refund-applications.interface';
import { EXPAND_DETAIL } from '@eskhata/util';
import { DateTimePipe } from '@eskhata/util';

@Component({
  selector: 'em-payments-refund-mobile-card',
  standalone: true,
  imports: [NgxPermissionsModule, SvgIconComponent, DateTimePipe],
  templateUrl: './payments-refund-mobile-card.component.html',
  styleUrl: './payments-refund-mobile-card.component.scss',
  animations: [EXPAND_DETAIL],
})
export class PaymentsRefundMobileCardComponent {
  @Input() statusLabel: string = '';
  @Input() application: IPaymentRefundApplications;
  readonly paymentUpdate = output<{ itemId: string; defaultValue: boolean }>();
  readonly toggleClicked = output<IPaymentRefundApplications>()

  onPaymentUpdate(defaultValue: boolean): void {
    this.paymentUpdate.emit({ itemId: this.application.id, defaultValue });
  }

  toggle(application: IPaymentRefundApplications): void {
    this.toggleClicked.emit(application);
  }
}
