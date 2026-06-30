import { Component, input, output } from '@angular/core';
import { EskhataBankLoaderComponent } from '@shared/components/eskhata-bank-loader/eskhata-bank-loader.component';
import { EMPaginationComponent } from '@shared/components/em-pagination/pagination.component';
import { IMobileCardField } from '@shared/components/mobile-card/interface/mobile-card';
import { IAdvancePayments } from '@modules/advance-payments/interface/advance-payments.interface';
import { ICaption, IPaginate } from '@core/interfaces';
import { NgClass } from '@angular/common';
import { TableStatusEnum } from '@core/enums/table-status.enum';
import { DestroyableComponent } from '@core/directives/destroyable.component';

@Component({
  selector: 'em-mobile-card',
  standalone: true,
  templateUrl: './mobile-card.component.html',
  styleUrl: './mobile-card.component.scss',
  imports: [EskhataBankLoaderComponent, EMPaginationComponent, NgClass],
})
export class MobileCardComponent extends DestroyableComponent {
  readonly items = input<IAdvancePayments[]>([]);
  readonly columns = input<ICaption[] | IMobileCardField[]>();
  readonly loading = input(false);
  readonly paginate = input<IPaginate>();
  readonly isMobile = input(false);
  readonly cardClick = output<string>();

  get displayColumns(): any[] {
    return this.columns().filter(col => col.key !== 'Статус');
  }

  formatUserValue(user: any, col: IMobileCardField): string {
    const value = user?.[col.field];

    if (value == null || value === '' || (Array.isArray(value) && value.length === 0)) {
      return '-';
    }

    switch (col.type) {
      case 'date':
      case 'datetime': {
        const date = new Date(value);
        return Number.isNaN(date.getTime()) ? '-' : date.toLocaleString('ru-RU');
      }

      case 'number':
        return new Intl.NumberFormat('ru-RU').format(value);

      case 'array':
        return Array.isArray(value) ? value.join(', ') : '-';

      case 'status':
        return value === true ? 'Активен' : value === false ? 'Неактивен' : String(value);

      default:
        return String(value);
    }
  }

  onItemClick(id: string): void {
    this.cardClick.emit(id);
  }

  readonly applicationStatusClasses: { [key: string]: string } = {
    [TableStatusEnum.ADVANCE_NEW]: 'no-verified',
    [TableStatusEnum.ADVANCE_IN_PROCESS]: 'in-process',
    [TableStatusEnum.ADVANCE_ISSUED]: 'completed',
    [TableStatusEnum.ADVANCE_REPAID]: 'process-completed',
    [TableStatusEnum.ADVANCE_OVERDUE]: 'rejected',
    [TableStatusEnum.ADVANCE_REJECTED]: 'canceled',
    [TableStatusEnum.ADVANCE_UNKNOWN]: 'unknown',
  };

  getStatusClass(statusId: string): string {
    return this.applicationStatusClasses[statusId] ?? 'unknown';
  }
}
