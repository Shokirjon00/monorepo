import { AfterViewInit, Component, DestroyRef, ElementRef, inject, OnInit, viewChild } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { PaymentService } from './services/payment.service';
import { TableComponent } from '@shared/components/table/table.component';
import { IFilterParams, IHeader, IPaginate, IRowAction } from '@core/interfaces';
import { ICaption } from '@core/interfaces/table1.interface';
import { IAction } from '@shared/components/actions/action.interface';
import { MatDialog } from '@angular/material/dialog';
import { Currencies, IPayment, IPaymentStatusAmount } from '@modules/payment/interfaces/payment.interface';
import { HeaderService } from '@core/services/header.service';
import { isEmptyObject } from '@core/utils/is-empty-object';
import { environment as env } from '@environments/environment';
import { SelectPeriodDialogComponent } from '@shared/dialogs/select-period-dialog/select-period-dialog.component';
import { parseFilterParams } from '@core/utils/filter-util';
import { MainFilterComponent } from '@shared/dialogs/main-filter/main-filter.component';
import { EXPAND_DETAIL } from '@shared/animations';
import { PaymentConfirmDialogComponent } from '@modules/payment/shared/payment-confirm-dialog/payment-confirm-dialog.component';
import { DomSanitizer } from '@angular/platform-browser';
import { isPhone, PERIOD_ID, TODAY_ID } from '@core/helper';
import { MessageService } from '@core/services/message.service';
import { ToastEnum } from '@core/enums/toast-enum';
import { HttpResponse } from '@angular/common/http';
import { printFile } from '@core/utils/print-file';
import { FileSaverService } from 'ngx-filesaver';
import { DateFormatEnum } from '@core/enums/date-format.enum';
import { DatePipe, NgClass } from '@angular/common';
import { SharedModule } from '@shared/shared.module';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { ToastModule } from '@shared/components/toast/toast.module';
import { MultiDropdownComponent } from '@shared/components/multi-dropdown/multi-dropdown.component';
import { provideNgxMask } from 'ngx-mask';
import { DropdownComponent } from '@shared/components/dropdown/dropdown.component';
import { EskhataBankLoaderComponent } from '@shared/components/eskhata-bank-loader/eskhata-bank-loader.component';
import { NgxPermissionsModule } from 'ngx-permissions';
import { ActionsComponent } from '@shared/components/actions/actions.component';
import { QuickFilterComponent } from '@shared/components/quick-filter/quick-filter.component';
import { PaginationComponent } from '@shared/components/pagination/pagination.component';
import { PaymentsConstants } from '@modules/payment/payments.constants';
import { DateTimePipe } from '@core/pipe/date-time.pipe';
import { MatchMode } from '@core/enums/match-mode.enum';
import { getFromLocalStorage } from '@core/utils';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

const paymentCompletedStatus = '5419a575-1c42-475e-90bc-5e16767ec806';

@Component({
  standalone: true,
  selector: 'em-transactions',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss'],
  animations: [EXPAND_DETAIL],
  imports: [
    SharedModule,
    AngularSvgIconModule,
    ToastModule,
    MultiDropdownComponent,
    DropdownComponent,
    EskhataBankLoaderComponent,
    NgxPermissionsModule,
    ActionsComponent,
    QuickFilterComponent,
    PaginationComponent,
    TableComponent,
    NgClass,
    DateTimePipe,
  ],
  providers: [PaymentService, provideNgxMask(), DatePipe],
})
export class PaymentComponent  implements OnInit, AfterViewInit {
  readonly table = viewChild(TableComponent);
  readonly print = viewChild.required<ElementRef>('print');
  readonly quickFilterComponent = viewChild<QuickFilterComponent>('quickFilterComponent');
  payments: IPayment[];
  loading: boolean = false;
  actionLoading: boolean = false;
  paginate: IPaginate;
  merchantApi = `${env.api.merchants}/${env.api.dictionaryWithoutPagination}`;
  posesApi = `${env.api.poses}/${env.api.dictionaryWithoutPagination}`;
  posesTypeApi = `${env.api.analyticsPosType}/${env.api.dictionary}`;
  dataFilterApi = `${env.api.analytics}/${env.api.dateFilter}`;
  statusApi = `${env.api.status}`;
  currencyApi = `${env.api.currencies}/${env.api.dictionary}`;
  dateTypeImage: any = ['day.svg', 'day.svg', 'week.svg', 'month.svg', 'year.svg', 'period.svg'];
  selectedMerchant: [{ name: string; icon: string }];
  selectedPos: { name: string; icon: string };
  selectedPosType: { name: string; icon: string };
  selectedStatus: { name: string; icon: string };
  currency: { name: string; icon: string };
  dateType: { name: string; icon?: string; id?: string };
  showSimpleFilter: boolean = false;
  isShowFilter: boolean = false;
  actions: IAction[] = PaymentsConstants.ACTIONS;
  captions: ICaption[] = PaymentsConstants.PAYMENTS_COLUMNS;
  tableActions: IRowAction[] = PaymentsConstants.TABLE_ACTIONS;
  paymentFilterMode: {field: string, mode: MatchMode}[] = PaymentsConstants.PAYMENT_FILTER_MODE;
  captionKey = 'payment';
  header: IHeader = {
    title: 'Платежи',
    isFilter: true,
    tabShow: false,
  };
  filterDisabled: boolean;
  dateFlag: boolean;
  merchantFilter: IFilterParams | any = {};
  posTypeFilter: IFilterParams | any = {};
  posFilter: IFilterParams | any = {};
  queryParams: IFilterParams | any = { page: 1 };
  paymentStatusAmounts: IPaymentStatusAmount[];
  showScrollButton: boolean = false;
  paymentStatusGroup = PaymentsConstants.PAYMENT_STATUS_GROUP;
  dictionary = PaymentsConstants.DICTIONARY;
  readonly isMobile = isPhone();
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly dialog = inject(MatDialog);
  private readonly fileSaverService = inject(FileSaverService);
  private readonly messageService = inject(MessageService);
  private readonly service = inject(PaymentService);
  private readonly matDialog = inject(MatDialog);
  private readonly headerService = inject(HeaderService);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly datePipe = inject(DatePipe);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    this.changePage();
    this.setDefault();
  }

  ngOnInit(): void {
    const paymentStorage = getFromLocalStorage('payment');
    const fieldsToExtract = this.captions
      .map(caption => caption.field);
    if (paymentStorage) {
      fieldsToExtract.forEach(field => {
        if (paymentStorage[field] !== undefined && paymentStorage[field] !== null && paymentStorage[field] !== '') {
          this.queryParams[field] = paymentStorage[field];
        }
      });
    }

    this.route.queryParams.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((queryParams: Params) => {
      if (!isEmptyObject(queryParams)) {
        this.handleQueryParams(queryParams);
      } else {
        this.resetToDefaultQueryParams();
      }
    });
  }

  ngAfterViewInit(): void {
    this.captions.map(
      (x: any, i: any) =>
        ({
          key: x,
          index: i,
          isSelected: true,
        }) as ICaption
    );
    this.table().render(this.captions, this.payments);
  }

  setDefault(): void {
    this.queryParams = {
      startedAt: TODAY_ID,
      merchantId: '',
      posId: '',
      posTypeId: '',
      paymentStatusGroupId: '',
      fromCurrencyId: '',
    };
    this.selectedMerchant = [{ name: 'Все торговые точки', icon: 'checkmark-double.svg' }];
    this.selectedPos = { name: 'Все кассы', icon: 'checkmark-double.svg' };
    this.selectedPosType = { name: 'Тип кассы', icon: 'checkmark-double.svg' };
    this.selectedStatus = { name: 'Статус', icon: 'checkmark-double.svg' };
    this.currency = { name: 'Валюта', icon: 'checkmark-double.svg' };
    this.dateType = { name: 'Сегодня', icon: 'day.svg' };
    this.posTypeFilter = {};
    this.posFilter = {};
  }

  dateChange(dateId: string): void {
    if (dateId === PERIOD_ID) {
      this.openPeriodDialog();
      return;
    }

    this.applyDatePreset(dateId);
  }

  private openPeriodDialog(): void {
    this.matDialog.open(SelectPeriodDialogComponent, {
      data: {
        start: this.queryParams.startDate,
        end: this.queryParams.endDate,
        maxSelectDays: 31,
      },
      panelClass: 'date-picker',
      height: 'auto',
    })
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(res => res ? this.applyPeriod(res) : this.resetToToday());
  }

  private applyPeriod(res: any): void {
    this.dateFlag = true;

    const start = res.start.format(DateFormatEnum.DATE_TIME_FORMAT);
    const end = res.end.format(DateFormatEnum.DATE_TIME_FORMAT);

    this.queryParams.startDate = start;
    this.queryParams.endDate = end;
    this.queryParams.startedAt = this.buildPeriodLabel(res.start, res.end);
    this.queryParams.page = 1;
    this.queryParams.filters = '';
    delete this.queryParams.pageSize;

    this.dateType = {
      name: `${res.start.format(DateFormatEnum.DATE_FORMAT)} - ${res.end.format(DateFormatEnum.DATE_FORMAT)}`,
      icon: 'week.svg',
      id: PERIOD_ID,
    };

    this.updateRoute();
  }

  private resetToToday(): void {
    this.dateFlag = false;
    delete this.queryParams.startDate;
    delete this.queryParams.endDate;

    this.queryParams.startedAt = TODAY_ID;
    this.queryParams.filters = '';

    this.dateType = { name: 'Сегодня', icon: 'day.svg' };

    this.updateRoute();
  }

  private applyDatePreset(dateId: string): void {
    this.dateFlag = false;

    delete this.queryParams.startDate;
    delete this.queryParams.endDate;

    this.queryParams.startedAt = dateId;

    this.clearParams();
  }

  private buildPeriodLabel(start: any, end: any): string {
    const startFormatted = this.datePipe.transform(start, 'dd.MM.yyyy');
    const endFormatted = this.datePipe.transform(end, 'dd.MM.yyyy');
    return `${PERIOD_ID}|${startFormatted} ${endFormatted}`;
  }

  private updateRoute(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: this.queryParams,
    }).catch();
  }


  clearPeriod(): void {
    if (this.queryParams.startDate && this.queryParams.endDate) {
      this.queryParams.startedAt = TODAY_ID;
      delete this.queryParams['startDate'];
      delete this.queryParams['endDate'];
      this.dateType = { name: 'Сегодня', icon: 'day.svg', id: TODAY_ID };
      this.dateFlag = false;
      this.clearParams();
    }
  }

  sortTable(value: string): void {
    this.queryParams.sorts = value;
    this.getPayments();
  }

  selectStatus(statusId: string): void {
    if (statusId) {
      this.queryParams.paymentStatusGroupId = statusId;
    } else {
      delete this.queryParams['paymentStatusGroupId'];
    }
    this.clearParams();
  }

  checkPaymentRefundStatus(paymentId: string): void {
    this.actionLoading = true;
    this.service
      .checkPaymentRefund(paymentId)
      .pipe(
        finalize(() => (this.actionLoading = false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(res => {
        if (res.status) {
          this.openPaymentRefundDialog(paymentId);
        } else {
          this.messageService.add({ severity: ToastEnum.ERROR, summary: res.message });
        }
      });
  }

  openPaymentRefundDialog(id: string): void {
    const payment = this.payments.find(i => i.id === id);
    this.dialog
      .open(PaymentConfirmDialogComponent, {
        disableClose: true,
        panelClass: 'custom-modalbox',
        maxWidth: '30vw',
        data: {
          id,
          amount: payment.amount,
          title: this.sanitizer.bypassSecurityTrustHtml(
            `Вы действительно хотите возвратить на сумму <span style="font-weight: 700">${payment.amount}</span> сомони?`
          ),
          successButtonText: 'Да',
          cancelButtonText: 'Нет',
        },
      })
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(
        res =>
          res &&
          this.messageService.add({
            severity: res.status ? ToastEnum.SUCCESS : ToastEnum.ERROR,
            summary: res.message,
          })
      );
  }

  openFilter(): void {
    this.matDialog
      .open(MainFilterComponent, {
        panelClass: 'mobile-dialog',
        data: {
          componentKey: this.captionKey,
          captions: this.captions,
          isCustomFilter: true,
          dateType: this.dateType,
          selectedMerchant: this.selectedMerchant,
          selectedPos: this.selectedPos,
          selectedPosType: this.selectedPosType,
          selectedStatus: this.selectedStatus,
          currency: this.currency,
        },
      })
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(res => {
        if (res) {
          this.activeFilter();
        }

        if (res === 'reset') {
          this.resetFilter();
        }
      });
  }

  merchantChange(merchantIds: string[]): void {
    this.queryParams.merchantId = merchantIds;
    this.posFilter.merchantId = merchantIds;
    this.clearPos();
  }

  clearMerchant(): void {
    this.queryParams.posId = '';
    this.queryParams.merchantId = '';
    this.selectedMerchant = [{ name: 'Все торговые точки', icon: 'checkmark-double.svg' }];
    this.selectedPos = { name: 'Все кассы', icon: 'checkmark-double.svg' };
    delete this.queryParams['posId'];
    delete this.queryParams['merchantId'];
    this.merchantFilter = {};
    this.posFilter = {};
    this.clearParams();
  }

  posesChange(posId: string): void {
    this.queryParams.posId = posId;
    this.posTypeFilter.id = posId;
    this.clearParams();
  }

  statusChange(paymentStatusGroupId: string): void {
    this.queryParams.paymentStatusGroupId = paymentStatusGroupId;
    this.clearParams();
  }

  currencyChange(fromCurrencyId: string): void {
    this.queryParams.fromCurrencyId = fromCurrencyId;
    this.clearParams();
  }

  clearPos(): void {
    this.queryParams.posId = '';
    this.selectedPos = { name: 'Все кассы', icon: 'checkmark-double.svg' };
    delete this.queryParams['posId'];
    this.clearParams();
  }

  posesTypeChange(posesTypeId: string): void {
    this.queryParams.posTypeId = posesTypeId;
    this.clearParams();
  }

  clearPosType(): void {
    this.queryParams.posTypeId = '';
    this.selectedPosType = { name: 'Тип кассы', icon: 'checkmark-double.svg' };
    delete this.queryParams['posTypeId'];
    this.clearParams();
  }

  clearStatus(): void {
    this.queryParams.posId = '';
    this.selectedStatus = { name: 'Статус', icon: 'checkmark-double.svg' };
    delete this.queryParams['paymentStatusGroupId'];
    this.clearParams();
  }

  clearCurrency(): void {
    this.queryParams.fromCurrencyId = '';
    this.currency = { name: 'Валюта', icon: 'checkmark-double.svg' };
    delete this.queryParams['fromCurrencyId'];
    this.clearParams();
  }

  clearParams(): void {
    Object.keys(this.queryParams).forEach(key => {
      if (!this.queryParams[key]) {
        delete this.queryParams[key];
      }
    });
    delete this.queryParams.pageSize
    this.queryParams.page = 1;
    this.queryParams.filters = '';
    this.updateRoute();
  }

  resetFilter(): void {
    this.setDefault();
    delete this.queryParams.startDate;
    delete this.queryParams.endDate;
    this.isShowFilter = false;
    this.showSimpleFilter = false;
    this.clearParams();
    this.quickFilterComponent()?.resetAllFilters();
    this.router.navigate([], {relativeTo: this.route, queryParams: this.queryParams});
  }

  statusIndicator(statusId: string): string {
    return this.dictionary[statusId] || '';
  }

  reloadTable(): void {
    this.getPayments();
  }

  formatCurrencies(currencies: Currencies[]): string {
    return currencies.map(c => `${c.count}шт / ${c.amount.toLocaleString()} ${c.currencyName}`).join(' | ');
  }

  getCheckInfo(paymentId: string): void {
    if (this.payments.find(item => item.id === paymentId).paymentStatusGroupId !== paymentCompletedStatus) {
      return this.messageService.add({
        severity: ToastEnum.ERROR,
        summary: 'Печать чека доступна только при статусе "Исполнено"',
      });
    }
    this.loading = true;
    this.service
      .getCheck(paymentId)
      .pipe(
        finalize(() => (this.loading = false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((res: HttpResponse<Blob>) => {
        if (isPhone()) {
          this.fileSaverService.save(res.body, res.headers.get('content-disposition'));
        } else {
          printFile(res.body);
        }
      });
  }

  private activeFilter(): void {
    Object.keys(this.queryParams).forEach(key => {
      if (!this.queryParams[key] || key === 'startDate' || key === 'endDate') {
        delete this.queryParams[key];
      }
    });
    this.queryParams.page = 1;
    this.route.queryParams.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params: any) => {
      if (params['paymentStatusGroupId']) {
        this.queryParams.paymentStatusGroupId = params['paymentStatusGroupId'];
        this.isShowFilter = Object.entries(params).filter(([key, value]) => value !== TODAY_ID).length > 0;
      } else {
        this.queryParams.paymentStatusGroupId = '';
      }
      this.makePeriodLabel(params);
    });
  }

  private getPayments(params = this.queryParams): void {
    this.loading = true;
    this.service
      .getPayments(params)
      .pipe(
        finalize(() => (this.loading = false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(res => {
        if (res.status) {
          this.payments = res.data.payments;
          this.paymentStatusAmounts = res.data.paymentStatusAmounts;
          this.paginate = res.meta.pagination;
        }
      });
  }

  private changePage(): void {
    this.headerService
      .getPageChange()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(pageChange => {
        if (pageChange) {
          this.queryParams.page = pageChange.pageNumber;
          this.queryParams.pageSize = pageChange.pageSize;
          this.queryParams.filters = '';
          this.updateRoute();
        }
      });
  }

  private makePeriodLabel(queryParams: Params): string {
    if (queryParams['startedAt']) {
      if (queryParams['startedAt'] === PERIOD_ID) {
        const { startDate, endDate } = this.queryParams;
        this.queryParams.filters = '';
        return `${queryParams['startedAt']}|${this.datePipe.transform(startDate, 'dd.MM.yyyy')} ${this.datePipe.transform(endDate, 'dd.MM.yyyy')}`;
      } else {
        return queryParams['startedAt'];
      }
    } else {
      return TODAY_ID;
    }
  }

  private handleQueryParams(queryParams: Params): void {
    this.filterDisabled = false;

    this.queryParams.page = Number(queryParams['page']) || 1;
    this.queryParams.pageSize = Number(queryParams['pageSize']) || 15;

    if (queryParams['startDate'] && queryParams['endDate']) {
      this.dateType = {
        name: `${this.datePipe.transform(queryParams['startDate'], 'dd.MM.yyyy')} - ${this.datePipe.transform(queryParams['endDate'], 'dd.MM.yyyy')}`,
        icon: 'week.svg',
        id: PERIOD_ID,
      };
    }

    this.queryParams.paymentStatusGroupId = '';

    for (const paramKey in queryParams) {
      const value = queryParams[paramKey];
      if (value && !PaymentsConstants.EXCLUDED_QUERY_PARAMS.includes(paramKey)) {
        this.queryParams[paramKey] = value;
      }
    }

    const merchantId = queryParams['merchantId'];
    this.queryParams.merchantId = merchantId ? (Array.isArray(merchantId) ? merchantId : [merchantId]) : null;
    this.posFilter.merchantId = this.queryParams.merchantId;

    if (!queryParams['posId']) {
      this.queryParams.posId = null;
    }

    this.queryParams.startedAt = this.makePeriodLabel(queryParams);
    this.queryParams = parseFilterParams(queryParams, this.queryParams, this.captions);

    this.isShowFilter = Object.entries(queryParams).some(
      ([key, value]) => value && key !== 'page' && key !== 'filters' && value !== TODAY_ID
    );

    this.getPayments();
  }

  private resetToDefaultQueryParams(): void {
    this.filterDisabled = true;
    this.queryParams['startedAt'] = TODAY_ID;
    this.updateRoute();
  }
}
