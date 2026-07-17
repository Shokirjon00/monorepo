import { AfterViewInit, Component, DestroyRef, inject, OnInit, signal, viewChild } from '@angular/core';
import { NgxPermissionsModule } from 'ngx-permissions';
import { CommonModule } from '@angular/common';
import { IFilterParams, IPaginate } from '@core/interfaces';
import { ICaption } from '@core/interfaces/table1.interface';
import { finalize } from 'rxjs';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { TableComponent } from '@shared/components/table/table.component';
import { ToastModule } from '@shared/components/toast/toast.module';
import { IPayment, IPaymentStatusAmount } from '@modules/payment/interfaces/payment.interface';
import { ShiftHistoryInfoConstants } from '@modules/shift-history/shift-history-info/shift-history-info.constants';
import { ShiftHistoryService } from '@modules/shift-history/service/shift-history.service';
import { PaymentService } from '@modules/payment/services/payment.service';
import { NgxMaskPipe, provideNgxMask } from 'ngx-mask';
import { EskhataBankLoaderComponent } from '@shared/components/eskhata-bank-loader/eskhata-bank-loader.component';
import { SharedModule } from '@shared/shared.module';
import { parseFilterParams } from '@core/utils/filter-util';
import { EMPaginationComponent } from '@shared/components/em-pagination/pagination.component';
import { EmHeaderComponent } from '@shared/components/em-header/em-header.component';
import { isPhone } from '@core/helper';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ShiftInfoMobileCardComponent } from '@modules/shift-history/shift-history-info/shift-info-mobile-card/shift-info-mobile-card.component';
import { DateTimePipe } from '@core/pipe/date-time.pipe';
import { restoreQueryParamsIfEmpty } from "@core/utils/restore-query-params";

@Component({
  selector: 'em-shift-history-info',
  standalone: true,
  imports: [
    CommonModule,
    TableComponent,
    ToastModule,
    NgxMaskPipe,
    EskhataBankLoaderComponent,
    SharedModule,
    NgxPermissionsModule,
    EMPaginationComponent,
    EmHeaderComponent,
    ShiftInfoMobileCardComponent,
    DateTimePipe,
  ],
  templateUrl: './shift-history-info.component.html',
  styleUrl: './shift-history-info.component.scss',
  providers: [PaymentService, ShiftHistoryService, provideNgxMask()],
})
export class ShiftHistoryInfoComponent implements OnInit, AfterViewInit {
  readonly table = viewChild(TableComponent);
  loading = signal(false);
  shiftInfo: IPayment[];
  shiftDetail: any;
  paymentStatusAmounts: IPaymentStatusAmount[];
  paginate: IPaginate | any;
  captionKey = 'shift_history_info';
  readonly isMobile = isPhone();
  params: Params = {};
  captions: ICaption[] = ShiftHistoryInfoConstants.SHIFT_HISTORY_INFO_COLUMNS;
  paymentProperties = ShiftHistoryInfoConstants.paymentProperties;
  expandedPaymentProperties = ShiftHistoryInfoConstants.expandedPaymentProperties;
  dictionary = ShiftHistoryInfoConstants.dictionary;
  showScrollButton: boolean = false;
  queryParams: IFilterParams | any = { page: 1 };

  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(ShiftHistoryService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly shiftId: string;

  constructor() {
    this.shiftId = this.route.snapshot.params['id'];
  }

  ngOnInit(): void {
    this.initRouteParams();
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
    this.table().render(this.captions, this.shiftInfo);
  }

  sortTable(value: string): void {
    this.queryParams.sorts = value;
    this.getShiftDetail();
  }

  statusIndicator(statusId: string): string {
    return this.dictionary[statusId] || '';
  }

  toggleExpand(payment: IPayment): void {
    payment.isActive = !payment.isActive;
  }

  back(): void {
    this.router.navigate(['/shift-history']).catch();
  }

  private getShiftDetail(params = this.queryParams): void {
    this.loading.set(true);
    this.service
      .getShiftDetail(this.shiftId, {
        page: params.page,
        pageSize: params.pageSize,
        filters: params.filters,
        sorts: params.sorts ?? '',
      })
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(res => {
        if (res.status) {
          this.shiftDetail = res.data;
          this.shiftInfo = res.data.payments;
          this.paymentStatusAmounts = res.data.paymentStatusAmounts;
          this.paginate = res.meta.pagination;
        }
      });
  }

  private initRouteParams(): void {
    this.route.queryParams.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(res => {
      restoreQueryParamsIfEmpty(this.captionKey, this.route, this.router);
      this.params = res;

      this.queryParams.page = res['page'];
      this.queryParams.pageSize = res['pageSize'];

      const params = parseFilterParams(res, this.queryParams, this.captions);

      if (this.params['module'] && this.captionKey !== this.params['module']) {
        this.queryParams.page = 1;
      } else {
        this.queryParams.module = this.captionKey;
      }
      this.getShiftDetail(params);
    });
  }
}
