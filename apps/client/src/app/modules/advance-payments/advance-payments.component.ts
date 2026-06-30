import { Component, DestroyRef, inject, signal, AfterViewInit, OnInit, viewChild } from '@angular/core';
import { TableComponent } from '@shared/components/table/table.component';
import { ICaption, IFilterParams, IPaginate } from '@core/interfaces';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { isPhone } from '@core/helper';
import { restoreQueryParamsIfEmpty } from '@core/utils/restore-query-params';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { parseFilterParams } from '@core/utils/filter-util';
import { EMPaginationComponent } from '@shared/components/em-pagination/pagination.component';
import { EmHeaderComponent } from '@shared/components/em-header/em-header.component';
import { NgxPermissionsModule } from 'ngx-permissions';
import { finalize } from 'rxjs';
import { AdvancePaymentsConstants } from '@modules/advance-payments/advance-payments.constants';
import { AdvancePaymentsService } from '@modules/advance-payments/service/advance-payments.service';
import { IAdvancePayments } from '@modules/advance-payments/interface/advance-payments.interface';
import { MobileCardComponent } from '@shared/components/mobile-card/mobile-card.component';
import { ConfirmDialogModel } from '@shared/dialogs/confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { AdvancePaymentComponent } from '@shared/dialogs/advance-payment/advance-payment.component';
import { provideNgxMask } from 'ngx-mask';
import { IBanner } from '@shared/components/banner/interface/banner';
import { bannerAmountSignal } from '@shared/components/banner/banner-signal';

@Component({
  selector: 'em-advance-payments',
  standalone: true,
  templateUrl: './advance-payments.component.html',
  styleUrl: './advance-payments.component.scss',
  imports: [EMPaginationComponent, TableComponent, EmHeaderComponent, NgxPermissionsModule, MobileCardComponent],
  providers: [AdvancePaymentsService, provideNgxMask()],
})
export class AdvancePaymentsComponent implements AfterViewInit, OnInit {
  readonly table = viewChild(TableComponent);
  amount: IBanner;
  advancePayments: IAdvancePayments[];
  columns = AdvancePaymentsConstants.ADVANCE_PAYMENTS_COLUMNS;
  cardFields = AdvancePaymentsConstants.ADVANCE_PAYMENTS_COLUMNS;
  captionKey = 'advancePaymentsFiltersForm';
  paginate: IPaginate;
  params: Params = {};
  showScrollButton: boolean = false;
  tableLoading = signal(false);
  amountLoading = signal(false);
  readonly isMobile = isPhone();
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(AdvancePaymentsService);
  private readonly dialog = inject(MatDialog);

  private queryParams: IFilterParams = {
    page: this.route.snapshot.queryParams['Page'] || 1,
    pageSize: 15,
  };

  ngOnInit(): void {
    this.getAmount();
    this.handleQueryParams();
  }

  ngAfterViewInit(): void {
    this.columns.map(
      (x: any, i: any) =>
        ({
          key: x,
          index: i,
          isSelected: true,
        }) as ICaption
    );
    this.table().render(this.columns, this.advancePayments);
  }

  sortTable(value: string): void {
    this.queryParams.sorts = value;
    this.getWithdrawalAmounts();
  }

  showDetail(id: string): void {
    this.router.navigate(['advance-payments/info', id]).catch();
  }

  private showAdvance(): void {
    const banner = bannerAmountSignal();
    const noData = banner.isAdvancePayoutsExist === false && banner.isBannerVisible === false;

    if (noData) {
      const dialogData = new ConfirmDialogModel('', '', '', false, 'Отмена');
      this.dialog.open(AdvancePaymentComponent, {
        disableClose: true,
        data: dialogData,
        panelClass: 'custom-modalbox',
        width: '500px',
      });
    }
  }

  private getAmount(): void {
    this.amountLoading.set(true);
    this.service
      .getAmounts()
      .pipe(
        finalize(() => this.amountLoading.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(res => {
        if (res.status && res.data) {
          bannerAmountSignal.set({
            amount: res.data.amount,
            isBannerVisible: res.data.isBannerVisible,
            isAdvancePayoutsExist: res.data.isAdvancePayoutsExist,
          });
        } else {
          bannerAmountSignal.set({
            amount: null,
            isBannerVisible: false,
            isAdvancePayoutsExist: false,
          });
        }
      });
  }

  private handleQueryParams(): void {
    this.route.queryParams.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(res => {
      restoreQueryParamsIfEmpty(this.captionKey, this.route, this.router);
      this.params = res;

      this.queryParams.page = res['page'];
      this.queryParams.pageSize = res['pageSize'];

      const params = parseFilterParams(res, this.queryParams, this.columns);

      if (this.params['module'] && this.captionKey !== this.params['module']) {
        this.queryParams.page = 1;
      } else {
        this.queryParams.module = this.captionKey;
      }

      this.getWithdrawalAmounts(params);
    });
  }

  private getWithdrawalAmounts(params = this.queryParams): void {
    this.tableLoading.set(true); this.service
      .getAdvancePayments(params)
      .pipe(
        finalize(() => this.tableLoading.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(res => {
        if (res.status) {
          this.advancePayments = res.data;
          this.paginate = res.meta.pagination;
          this.showAdvance();
        }
      });
  }
}
