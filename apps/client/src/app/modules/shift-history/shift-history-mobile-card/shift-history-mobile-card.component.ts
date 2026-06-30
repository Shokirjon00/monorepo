import { Component,Input, output } from '@angular/core';
import { NgxPermissionsModule } from 'ngx-permissions';
import { DateTimePipe } from '@core/pipe/date-time.pipe';

@Component({
  selector: 'em-shift-history-mobile-card',
  standalone: true,
  imports: [NgxPermissionsModule, DateTimePipe],
  templateUrl: './shift-history-mobile-card.component.html',
  styleUrl: './shift-history-mobile-card.component.scss',
})
export class ShiftHistoryMobileCardComponent {
  @Input() application: any;
  @Input() loading: boolean = false;

  readonly detailClicked = output<string>();
  readonly statusChangeRequested = output<any>();
  readonly receiptRequested = output<string>();

  showDetail(id: string): void {
    this.detailClicked.emit(id);
  }

  confirmChangeStatus(application: any): void {
    this.statusChangeRequested.emit(application);
  }

  openReceiptDialog(id: string): void {
    this.receiptRequested.emit(id);
  }
}
