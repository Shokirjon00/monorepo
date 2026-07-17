import { Component, Input, output } from '@angular/core';
import { DateTimePipe } from "@core/pipe/date-time.pipe";
import { TableStatusEnum } from "@core/enums/table-status.enum";
import { NgClass } from "@angular/common";
import { ISupportCenter } from "@core/interfaces";

@Component({
  standalone: true,
  selector: 'em-support-center-mobile-card',
  imports: [
    DateTimePipe,
    NgClass
  ],
  templateUrl: './support-center-mobile-card.component.html',
  styleUrl: './support-center-mobile-card.component.scss'
})
export class SupportCenterMobileCardComponent {
  @Input() application: ISupportCenter;
  @Input() loading: boolean = false;

  readonly detailClicked = output<string>();
  readonly statusChangeRequested = output<any>();
  readonly receiptRequested = output<string>();

  showDetail(id: string): void {
    this.detailClicked.emit(id);
  }

  readonly supportStatusClasses: Partial<Record<TableStatusEnum, string>> = {
    [TableStatusEnum.SUPPORT_NEW]: 'process-completed',
    [TableStatusEnum.SUPPORT_COMPLETED]: 'completed',
    [TableStatusEnum.SUPPORT_IN_PROCESS]: 'in-process',
    [TableStatusEnum.SUPPORT_REJECTED]: 'rejected',
    [TableStatusEnum.SUPPORT_CANCELED]: 'canceled',
  };

  getStatusClass(statusId: string | TableStatusEnum): string {
    return this.supportStatusClasses[statusId as TableStatusEnum] || 'unknown';
  }
}
