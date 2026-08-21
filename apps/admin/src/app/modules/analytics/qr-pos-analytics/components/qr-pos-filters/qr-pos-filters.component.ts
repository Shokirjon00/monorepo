import { Component, computed, DestroyRef, inject, input, output } from '@angular/core';

import { Params } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import moment from 'moment';
import { environment as env } from '@environments/environment';
import { PERIOD_ID, TODAY_ID } from '@core/helper';
import { DateFormatEnum } from '@eskhata/util';
import { DropdownComponent } from '@eskhata/ui';
import { SelectPeriodDialogComponent } from '@shared/dialogs/select-period-dialog/select-period-dialog.component';
import { IQrPosFilter } from '../../interfaces/qr-pos-analytics.interface';
import { QrPosChannel } from '@core/enums/qr-pos-enum';
import { ISelectedLabel } from './qr-pos-filters.interface';
import {
  idOf,
  labelOf,
  QR_POS_CHANNEL_OPTIONS,
  QR_POS_DATE_TYPE_IMAGES,
  QR_POS_FILTER_DEFAULTS as DEFAULTS,
  QR_POS_STATUS_OPTIONS,
  sameParams,
} from './qr-pos-filters.constants';

@Component({
  standalone: true,
  selector: 'em-qr-pos-filters',
  templateUrl: './qr-pos-filters.component.html',
  styleUrls: ['./qr-pos-filters.component.scss'],
  imports: [DropdownComponent],
})
export class QrPosFiltersComponent {
  readonly filter = input.required<IQrPosFilter>();
  readonly filterChange = output<Partial<IQrPosFilter>>();
  readonly resetFilters = output<void>();

  readonly QrPosChannel = QrPosChannel;

  private readonly dialog = inject(MatDialog);
  private readonly destroyRef = inject(DestroyRef);

  readonly dateApi = `${env.api.analytics}/${env.api.dateFilter}`;
  readonly companyApi = `${env.api.companies}/${env.api.dictionary}`;
  readonly merchantApi = `${env.api.merchants}/${env.api.dictionary}`;
  readonly posApi = `${env.api.poses}/${env.api.dictionary}`;
  readonly regionApi = `${env.api.regions}/${env.api.dictionary}`;
  readonly currencyApi = `${env.api.currencies}/${env.api.dictionary}`;

  readonly channelOptions = QR_POS_CHANNEL_OPTIONS;
  readonly statusOptions = QR_POS_STATUS_OPTIONS;
  readonly dateTypeImage = QR_POS_DATE_TYPE_IMAGES;

  readonly isPeriod = computed(() =>
    this.filter().dateFilterTypeId === PERIOD_ID && !!this.filter().startDate && !!this.filter().endDate);

  readonly canReset = computed<boolean>(() => {
    const f = this.filter();
    const dateChanged = !!f.dateFilterTypeId && f.dateFilterTypeId !== TODAY_ID;
    const channelChanged = !!f.channel && f.channel !== QrPosChannel.All;
    return dateChanged || channelChanged ||
      !!f.companyId || !!f.merchantId || !!f.posId ||
      !!f.statusId || !!f.regionId || !!f.currencyId;
  });

  private readonly keep = {
    company: DEFAULTS.company(),
    merchant: DEFAULTS.merchant(),
    pos: DEFAULTS.pos(),
    region: DEFAULTS.region(),
    currency: DEFAULTS.currency(),
  };

  readonly dateLabel = computed<ISelectedLabel>(() => {
    const f = this.filter();
    return this.isPeriod()
      ? {...labelOf(`${this.formatDate(f.startDate!)} - ${this.formatDate(f.endDate!)}`, 'week.svg'), id: PERIOD_ID}
      : DEFAULTS.date();
  });

  readonly selectedCompany = computed(() => this.filter().companyId ? this.keep.company : DEFAULTS.company());
  readonly selectedMerchant = computed(() => this.filter().merchantId ? this.keep.merchant : DEFAULTS.merchant());
  readonly selectedPos = computed(() => this.filter().posId ? this.keep.pos : DEFAULTS.pos());
  readonly selectedRegion = computed(() => this.filter().regionId ? this.keep.region : DEFAULTS.region());
  readonly selectedCurrency = computed(() => this.filter().currencyId ? this.keep.currency : DEFAULTS.currency());

  readonly selectedChannel = computed<ISelectedLabel>(() => {
    const opt = this.channelOptions.find(o => o.id === (this.filter().channel || QrPosChannel.All));
    return opt ? labelOf(opt.name) : DEFAULTS.channel();
  });

  readonly selectedStatus = computed<ISelectedLabel>(() => {
    const opt = this.statusOptions.find(o => o.id === (this.filter().statusId || ''));
    return opt ? labelOf(opt.name) : DEFAULTS.status();
  });

  readonly companyFilter = computed<Params>(() => (this.filter().companyId ? {companyId: this.filter().companyId!} : {}),{equal: sameParams});
  readonly merchantFilter = computed<Params>(() => (this.filter().merchantId ? {merchantId: this.filter().merchantId!} : {}), {equal: sameParams});

  date(id: string): void {
    if (id === PERIOD_ID) {
      this.openPeriodDialog();
      return;
    }
    this.filterChange.emit({dateFilterTypeId: id, startDate: '', endDate: ''});
  }

  clearPeriod(): void {
    this.filterChange.emit({dateFilterTypeId: TODAY_ID, startDate: '', endDate: ''});
  }

  company(id: string): void {
    this.filterChange.emit({companyId: id, merchantId: '', posId: ''});
  }

  clearCompany(): void {
    this.company('');
  }

  merchant(id: string): void {
    this.filterChange.emit({merchantId: id, posId: ''});
  }

  clearMerchant(): void {
    this.merchant('');
  }

  pos(id: string): void {
    this.filterChange.emit({posId: id});
  }

  clearPos(): void {
    this.pos('');
  }

  channel(value: string | { id?: string }): void {
    const id = idOf(value);
    this.filterChange.emit({channel: (id || QrPosChannel.All) as QrPosChannel});
  }

  clearChannel(): void {
    this.channel(QrPosChannel.All);
  }

  status(value: string | { id?: string }): void {
    this.filterChange.emit({statusId: idOf(value)});
  }

  clearStatus(): void {
    this.status('');
  }

  region(id: string): void {
    this.filterChange.emit({regionId: id});
  }

  clearRegion(): void {
    this.region('');
  }

  currency(id: string): void {
    this.filterChange.emit({currencyId: id});
  }

  clearCurrency(): void {
    this.currency('');
  }

  reset(): void {
    if (!this.canReset()) return;
    this.resetFilters.emit();
  }

  private openPeriodDialog(): void {
    this.dialog
      .open(SelectPeriodDialogComponent, {
        data: {start: this.filter().startDate, end: this.filter().endDate},
        panelClass: 'date-picker',
        height: '460px',
      })
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(range => {
        if (!range?.start || !range?.end) return;
        this.filterChange.emit({
          dateFilterTypeId: PERIOD_ID,
          startDate: range.start.clone().startOf('day').format(DateFormatEnum.YEAR_DATE_TIME_FULL_FORMAT),
          endDate: range.end.clone().endOf('day').format(DateFormatEnum.YEAR_DATE_TIME_FULL_FORMAT),
        });
      });
  }

  private formatDate(value: string): string {
    return moment(value).format(DateFormatEnum.DATE_FORMAT);
  }
}
