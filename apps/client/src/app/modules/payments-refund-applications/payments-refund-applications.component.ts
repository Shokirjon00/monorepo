import { AfterViewInit, Component, DestroyRef, inject, OnInit, signal, viewChild } from '@angular/core';
import { TableComponent } from '@shared/components/table/table.component';
import { IPaginate, ToastEnum, EXPAND_DETAIL } from '@eskhata/util';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { IFilterParams } from '@core/interfaces/filter-params.interface';
import { finalize, of } from 'rxjs';
import { parseFilterParams } from '@core/utils/filter-util';
import { MessageService } from '@core/services/message.service';
import { MatDialog } from '@angular/material/dialog';
import { ICaption, IRowAction } from '@core/interfaces/table.interface';
import { DomSanitizer } from '@angular/platform-browser';
import { ConfirmDialogComponent } from '@shared/dialogs/confirm-dialog/confirm-dialog.component';
import { delay, mergeMap } from 'rxjs/operators';
import { RefundPaymentApplicationService } from '@core/services/payments-refund-applications.services';
import { IPaymentRefundApplications } from '@core/interfaces/payments-refund-applications.interface';
import { ToastModule } from '@shared/components/toast/toast.module';
import { EskhataBankLoaderComponent } from '@shared/components/eskhata-bank-loader/eskhata-bank-loader.component';
import { SharedModule } from '@shared/shared.module';
import { isPhone } from '@core/helper';
import { NgxPermissionsModule } from 'ngx-permissions';
import { PaymentsRefundApplicationsConstants } from '@modules/payments-refund-applications/payments-refund-applications.constants';
import { EMPaginationComponent } from '@shared/components/em-pagination/pagination.component';
import { EmHeaderComponent } from '@shared/components/em-header/em-header.component';
import { isEmptyObject } from '@core/utils/is-empty-object';
import { setDefaultFilterValue } from '@core/utils/route-param-parse';
import { PaymentsRefundMobileCardComponent } from '@modules/payments-refund-applications/payments-refund-mobile-card/payments-refund-mobile-card.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { restoreQueryParamsIfEmpty } from '@core/utils/restore-query-params';

@Component({
  standalone: true,
  selector: 'em-payments-refund-mobile-card-applications',
  templateUrl: './payments-refund-applications.component.html',
  providers: [RefundPaymentApplicationService],
  animations: [EXPAND_DETAIL],
  imports: [
    ToastModule,
    EskhataBankLoaderComponent,
    SharedModule,
    NgxPermissionsModule,
    TableComponent,
    EMPaginationComponent,
    EmHeaderComponent,
    PaymentsRefundMobileCardComponent,
  ],
  styleUrls: ['./payments-refund-applications.component.scss'],
})
export class PaymentsRefundApplicationsComponent implements OnInit, AfterViewInit {
  readonly table = viewChild(TableComponent);
  loading = signal(false);
  applications: IPaymentRefundApplications[] = [];
  captions = PaymentsRefundApplicationsConstants.PAYMENTS_REFUND_APPLICATIONS_COLUMNS;
  dictionary = PaymentsRefundApplicationsConstants.dictionary;
  paymentStatusGroup = PaymentsRefundApplicationsConstants.PAYMENT_STATUS_GROUP;
  tableActions: IRowAction[] = PaymentsRefundApplicationsConstants.TABLE_ACTIONS;
  paginate: IPaginate | any;
  params: Params = {};
  captionKey = 'paymentRefundFiltersForm';
  showScrollButton: boolean = false;
  readonly isMobile = isPhone();
  queryParams: IFilterParams | any = { page: 1 };

  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly route = inject(ActivatedRoute);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly messageService = inject(MessageService);
  private readonly service = inject(RefundPaymentApplicationService);

  ngOnInit(): void {
    this.initRouteParams();
    this.setDefault();
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
    this.table().render(this.captions, this.applications);
  }

  paymentUpdate(value: { itemId: string; defaultValue: boolean }): void {
    let id = value.itemId;
    const payment = this.applications.find(i => i.id === id);
    this.dialog
      .open(ConfirmDialogComponent, {
        disableClose: true,
        panelClass: 'custom-modalbox',
        data: {
          title: this.sanitizer.bypassSecurityTrustHtml(
            value.defaultValue
              ? `Вы действительно хотите одобрить возврат?<br>Сумма <span style="font-weight: 700">${payment?.amount}</span> будет возвращена покупателю.`
              : `Вы действительно хотите отклонить <br> заявку на возврат?`
          ),
          showInput: !value.defaultValue,
          successButtonText: 'Да',
          cancelButtonText: 'Нет',
        },
        maxWidth: '90vw',
      })
      .afterClosed()
      .subscribe(res => res && this.onSubmit(id, value.defaultValue, res));
  }

  sortTable(value: string): void {
    this.queryParams.sorts = value;
    this.getApplication();
  }

  setDefault(): void {
    this.queryParams.statusId = '_';
  }

  selectStatus(statusId: string): void {
    if (statusId) {
      this.queryParams.statusId = statusId;
    } else {
      delete this.queryParams['statusId'];
    }
    this.clearParams();
  }

  clearParams(): void {
    this.queryParams.page = 1;
    this.queryParams.filters = '';
    this.router
      .navigate([], {
        relativeTo: this.route,
        queryParams: this.queryParams,
      })
      .catch();
  }

  statusIndicator(statusId: string): string {
    return this.dictionary[statusId] || '';
  }

  toggleExpand(application: IPaymentRefundApplications): void {
    application.isActive = !application.isActive;
  }

  private onSubmit(id: string, confirm: boolean, reason: string): void {
    this.loading.set(true);
    this.service
      .confirm({ id: id, isConfirm: confirm, description: reason })
      .pipe(
        mergeMap(res => {
          this.messageService.add({
            severity: res.status ? ToastEnum.SUCCESS : ToastEnum.ERROR,
            summary: res.message,
          });
          this.getApplication();
          return of(res).pipe(delay(res.status ? 2000 : 0));
        }),
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loading.set(false))
      )
      .subscribe();
  }

  private getApplication(params = this.queryParams): void {
    this.loading.set(true);
    this.service
      .getAll(params)
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(res => {
        if (res.status) {
          this.applications = res.data;
          this.paginate = res.meta.pagination;
        }
      });
  }

  private initRouteParams(): void {
    this.route.queryParams.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((res: Params) => {
      restoreQueryParamsIfEmpty(this.captionKey, this.route, this.router);
        this.queryParams = setDefaultFilterValue(res, this.captionKey);
        const params = parseFilterParams(res, this.queryParams, this.captions);
        this.getApplication(params);
    });
  }
}
