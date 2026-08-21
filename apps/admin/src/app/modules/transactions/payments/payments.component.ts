import { AfterViewInit, Component, inject, OnInit, signal, viewChild } from '@angular/core';
import { ActionsComponent, BottomSheetComponent, EmHeaderComponent, EMPaginationComponent, TableComponent, TopButtonComponent } from '@eskhata/ui';
import { IAction } from '@eskhata/util';
import { ICaption, IFilterParams, IOptionAction, IPaginate, IRowAction } from '@core/interfaces';
import { MessageService } from '@core/services';
import { PaymentsConstants } from './payments.constants';
import { SharedModule } from '@shared/shared.module';
import { PaymentsService } from '@modules/transactions/services/payments.service';
import { JobLogService } from '@modules/job-log/services/job-log.service';
import { DestroyableComponent } from '@eskhata/util';
import { Currencies, IPayment, IPaymentStatusAmount } from '@modules/transactions/payments/interfaces';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { Subscription, takeUntil } from 'rxjs';
import { parseFilterParams, setDefaultFilterValue } from '@core/utils';
import { finalize } from 'rxjs/operators';
import { ToastEnum, EXPAND_DETAIL } from '@eskhata/util';
import { PaymentConfirmDialogComponent } from './shared/payment-confirm-dialog/payment-confirm-dialog.component';
import { NgxMaskPipe } from 'ngx-mask';
import { NgxPermissionsModule, NgxPermissionsService } from 'ngx-permissions';
import { ITab } from '@eskhata/util';
import { DataSourceService } from '@eskhata/data-access';
import { SvgIconComponent } from "angular-svg-icon";
import { isPhone } from "@core/helper";
import { ScrollEventDirective } from "@core/directives/scroll-event.directive";
import { TableStatusEnum } from '@eskhata/util';
import { MatBottomSheet } from "@angular/material/bottom-sheet";
import { DateTimePipe } from '@eskhata/util';

@Component({
  standalone: true,
  selector: 'em-payments',
  templateUrl: './payments.component.html',
  styleUrls: ['./payments.component.scss'],
  animations: [EXPAND_DETAIL],
  providers: [
    PaymentsService,
    JobLogService,
    DataSourceService
  ],
  imports: [
    TableComponent,
    SharedModule,
    ActionsComponent,
    NgxPermissionsModule,
    EmHeaderComponent,
    EMPaginationComponent,
    SvgIconComponent,
    ScrollEventDirective,
    TopButtonComponent,
    DateTimePipe,
  ]
})
export class PaymentsComponent extends DestroyableComponent implements OnInit, AfterViewInit {
  readonly table = viewChild(TableComponent);
  paymentStatusAmounts: IPaymentStatusAmount[];
  payments: IPayment[];
  loading = signal(false);
  showScrollButton = signal(false);
  isVisible = signal(true);
  showDropdown = signal(false);
  actions: IAction[] = PaymentsConstants.PAYMENTS_ACTIONS;
  columns: any = PaymentsConstants.PAYMENTS_COLUMNS;
  tableActions: IRowAction[] = PaymentsConstants.TABLE_ACTIONS;
  optionActions: IOptionAction[] = PaymentsConstants.TABLE_SETTING_OPTIONS;
  tabMenuItems: ITab[] = PaymentsConstants.HEADER_TABS;
  filterParams: any;
  field: any;
  captionKey = 'payment';
  paginate: IPaginate | any;
  isMobile = isPhone();
  options = [
    {
      text: 'Возврат',
      code: 'check-payment-refund-status',
      permissionName: 'PaymentCancel',
      action: (paymentId: string): void => this.checkPaymentRefundStatus(paymentId)
    },
    {
      text: 'Редактировать',
      code: 'payment-update',
      permissionName: 'PaymentUpdate',
      action: (paymentId: string): void => this.paymentUpdate(paymentId)
    },
    {
      text: 'Проверка статуса в IFT',
      code: 'check-payment-status-ift',
      permissionName: 'PaymentGetStatus',
      action: (payment: any): void => this.checkPaymentStatusIft(payment)
    },
    {
      text: 'Проверка статуса в JetQR',
      code: 'check-payment-status-jetQr',
      permissionName: 'PaymentGetStatusJetQr',
      action: (payment: any): void => this.checkPaymentStatusJetQr(payment)
    }
  ];

  readonly statusCode = TableStatusEnum;
  private readonly dialog = inject(MatDialog);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly service = inject(PaymentsService);
  private readonly messageService = inject(MessageService);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly jobLogService = inject(JobLogService);
  private readonly permissionsService = inject(NgxPermissionsService);
  private readonly bottomSheet = inject(MatBottomSheet);
  private queryParams: IFilterParams = {
    page: this.route.snapshot.queryParams['Page'] || 1,
    pageSize: 15
  };
  private paymentSub: Subscription;

  ngOnInit(): void {
    this.initRouteParams();
    this.isVisible.set(this.getVisibility());
  }

  ngAfterViewInit(): void {
    this.columns.map((x: any, i: any,) => ({
      key: x,
      index: i,
      isSelected: true
    } as ICaption));
    this.table()?.render(this.columns, this.payments);
  }

  statusIndicator(statusId: string): string {
    switch (statusId) {
      case this.statusCode.COMPLETED:
        return 'completed';
      case this.statusCode.REJECTED:
        return 'rejected';
      case this.statusCode.NO_VERIFIED:
        return 'no-verified';
      case this.statusCode.IN_PROCESS:
        return 'in-process';
      case this.statusCode.RETURNED:
        return 'returned';
      case this.statusCode.UNKNOWN:
        return 'unknown';
      case this.statusCode.CANCELED:
        return 'cancel'
    }
    return '';
  }

  showDetail(paymentId: string): void {
    this.router.navigate(['/transactions/payments', paymentId]).catch();
  }

  link(dataDetail: { dataSourceId: string, fieldName: string }): void {
    if (dataDetail.fieldName === 'companyName') {
      const companyId = this.payments.find(item => item.id === dataDetail.dataSourceId).companyId;
      this.router.navigate(['clients/company', companyId]).catch();
    }
  }

  /**
   * reload table
   */
  reloadTable(): void {
    this.getPayments();
  }

  checkPaymentRefundStatus(paymentId: string): void {
    this.loading.set(true);
    this.service.checkPaymentRefund(paymentId)
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntil(this.destroyed$)
      )
      .subscribe(res => {
        if (res.status) {
          this.openPaymentRefundDialog(paymentId);
        } else {
          this.messageService.add({severity: ToastEnum.ERROR, summary: res.message});
        }
      })
  }


  openPaymentRefundDialog(id: string): void {
    const payment = this.payments.find(i => i.id === id);
    this.dialog.open(PaymentConfirmDialogComponent, {
      disableClose: true,
      panelClass: 'custom-modalbox',
      maxWidth: '30vw',
      data: {
        id,
        amount: payment.fromAmount,
        title: this.sanitizer.bypassSecurityTrustHtml(`Вы действительно хотите возвратить на сумму <span style="font-weight: 700">${payment.fromAmount}</span> сомони?`)
      },
    })
      .afterClosed()
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => res && this.messageService.add({severity: ToastEnum.SUCCESS, summary: res}));
  }

  sortTable(value: string): void {
    this.queryParams.sorts = value;
    this.getPayments();
  }

  paymentUpdate(id: string): void {
    this.loading.set(true);
    this.service.getPaymentForEdit(id)
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntil(this.destroyed$)
      )
      .subscribe(res => {
        if (res.status) {
          this.service.paymentUpdate = res.data;
          this.router.navigate(['transactions/payments', id, 'edit'], {queryParams: {paymentMode: 'parent'}}).catch();
        } else {
          this.messageService.add({severity: ToastEnum.ERROR, summary: res.message});
        }
      })
  }

  formatCurrencies(currencies: Currencies[]): string {
    return currencies.map(c => `${c.count}шт / ${c.amount.toLocaleString()} ${c.currencyName}`).join(' | ');
  }

  checkStatus(payment: { item: IPayment, key: string }): void {
    if (payment.key === 'check-ift') {
      this.checkPaymentStatusIft(payment.item);
    } else if (payment.key === 'check-jet-qr') {
      this.checkPaymentStatusJetQr(payment.item);
    }
  }

  checkPaymentStatusIft(payment: IPayment): void {
    this.service.checkPaymentStatusIft(payment.id)
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntil(this.destroyed$)
      ).subscribe((res: any) => {
      this.loading.set(true);
      if (res.status) {
        if (res.data.jobLogId) {
          this.checkJobLog(res.data.jobLogId);
          this.messageService.add({severity: ToastEnum.SUCCESS, summary: res.message});
        } else {
          this.messageService.add({
            severity: res.data.paymentStatus ? ToastEnum.SUCCESS : ToastEnum.ERROR,
            summary: res.message
          });
        }
      } else {
        this.messageService.add({severity: ToastEnum.ERROR, summary: res.message});
      }
    })
  }

  checkPaymentStatusJetQr(payment: IPayment): void {
    this.loading.set(true);
    this.service.checkPaymentStatusJetQr(payment.id)
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntil(this.destroyed$)
      )
      .subscribe((res: any) => {
        if (res.status) {
          this.messageService.add({
            severity: res.data.paymentStatus ? ToastEnum.SUCCESS : ToastEnum.ERROR,
            summary: res.data.message
          });
        } else {
          this.messageService.add({severity: ToastEnum.ERROR, summary: res.message});
        }
      })
  }

  toggleVisibility(): void {
    const newValue = !this.isVisible();
    this.isVisible.set(newValue);
    this.setVisibility(newValue);
  }

  openDropdown(payment: any): void {
    if (this.isMobile) {
      const options = this.options.filter(item =>
        this.permissionsService.getPermission(item?.permissionName)
      );
      if (!options.length) return;

      this.bottomSheet
        .open(BottomSheetComponent, {
          panelClass: 'bottom-sheet',
          data: {
            dataSource: options,
            labelKey: 'text'
          }
        })
        .afterDismissed()
        .subscribe(option => {
          if (option && option.action) {
            if (option.code === 'check-payment-refund-status' || option.code === 'payment-update') {
              option.action(payment.id);
            } else {
              option.action(payment);
            }
          }
        });
    } else {
      this.showDropdown.set(!this.showDropdown());
    }
  }

  private initRouteParams(): void {
    this.route.queryParams
      .pipe(takeUntil(this.destroyed$))
      .subscribe((res: Params) => {
        this.queryParams = setDefaultFilterValue(res, this.captionKey);
        const parsedParams: Params = parseFilterParams(res, this.queryParams, this.columns);
        if (Object.keys(parsedParams).length) {
          this.getPayments(parsedParams);
        }
      });
  }

  private checkJobLog(jobLogId: string): void {
    this.jobLogService.check(jobLogId)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => {
        if (!res.status) {
          this.messageService.add({severity: ToastEnum.ERROR, summary: res.message});
        } else {
          if (res.data.status === 0 && res.data.allowedTryCount >= 0) {
            return this.setTimeout(() => this.checkJobLog(jobLogId), 2000);
          } else if (res.data.status === 1) {
            this.messageService.add({severity: ToastEnum.SUCCESS, summary: res.message});
          }
        }
      });
  }

  private getPayments(params = this.queryParams): void {
    this.loading.set(true);
    if (this.paymentSub && !this.paymentSub.closed) {
      this.paymentSub.unsubscribe();
    }
    this.paymentSub = this.service.getPayments({
      page: params.page,
      pageSize: params.pageSize,
      filters: params.filters,
      sorts: params.sorts ?? ""
    })
      .pipe(
        takeUntil(this.destroyed$)
      )
      .subscribe(res => {
        if (res.status) {
          this.payments = res.data.payments;
          this.paymentStatusAmounts = res.data.paymentStatusAmounts;
          this.paginate = res.meta.pagination;
        }
        this.loading.set(false);
      })
  }

  private getVisibility(): boolean {
    const savedVisibility = localStorage.getItem('isVisible');
    return savedVisibility !== null ? JSON.parse(savedVisibility) : true;
  }

  private setVisibility(value: boolean): void {
    localStorage.setItem('isVisible', JSON.stringify(value));
  }
}
