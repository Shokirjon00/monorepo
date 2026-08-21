import { Component, Input, output } from '@angular/core';
import { DateTimePipe } from '@eskhata/util';
import { IOrder } from '@modules/order/interfaces/order';

@Component({
  selector: 'em-order-mobile-card',
  imports: [DateTimePipe],
  templateUrl: './order-mobile-card.component.html',
  styleUrl: './order-mobile-card.component.scss',
})
export class OrderMobileCardComponent {
  @Input() order: IOrder;
  @Input() loading: boolean = false;

  readonly detailClicked = output<string>();

  showDetail(id: string): void {
    this.detailClicked.emit(id);
  }
}
