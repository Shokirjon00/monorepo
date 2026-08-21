import { AfterViewInit, Component, DestroyRef, inject, OnInit, signal, viewChild } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { finalize, Subscription } from 'rxjs';
import { Location } from '@angular/common';
import { NgxPermissionsModule } from 'ngx-permissions';
import { EmHeaderComponent, EMPaginationComponent, TableComponent, ToastModule } from '@eskhata/ui';
import { IFilterParams, IPaginate } from '@core/interfaces';
import { BannerComponent } from '@shared/components/banner/banner.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AdvancePaymentsService } from '@modules/advance-payments/service/advance-payments.service';
import { AdvancePaymentsInfoConstants } from '@modules/advance-payments/advance-payments-info/advance-payments-info.constants';
import { ICaption } from '@eskhata/util';
import { isPhone } from '@core/helper';
import { parseFilterParams } from '@core/utils/filter-util';
import { MobileCardComponent } from '@shared/components/mobile-card/mobile-card.component';
import { restoreQueryParamsIfEmpty } from '@core/utils/restore-query-params';
import { provideNgxMask } from 'ngx-mask';

@Component({
  standalone: true,
  selector: 'em-advance-payments-info',
  templateUrl: './advance-payments-info.component.html',
  styleUrls: ['./advance-payments-info.component.scss'],
  imports: [
    ToastModule,
    EmHeaderComponent,
    BannerComponent,
    EMPaginationComponent,
    TableComponent,
    NgxPermissionsModule,
    MobileCardComponent,
  ],
  providers: [AdvancePaymentsService, provideNgxMask()],
})
export class AdvancePaymentsInfoComponent implements OnInit, AfterViewInit {
  readonly table = viewChild(TableComponent);
  advanceDetail: any[];
  captions = AdvancePaymentsInfoConstants.ADVANCE_PAYMENTS_INFO_COLUMNS;
  captionKey = 'advancePaymentsInfoFiltersForm';
  queryParams: IFilterParams = { page: 1 };
  paginate: IPaginate;
  params: Params = {};
  loading = signal(false);

  readonly isMobile = isPhone();
  private advancePaymentSub: Subscription;
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly advanceService = inject(AdvancePaymentsService);
  private readonly location = inject(Location);
  private readonly destroyRef = inject(DestroyRef);
  private readonly id = this.activatedRoute.snapshot.params['id'];

  ngOnInit(): void {
    this.handleQueryParams();
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
    this.table().render(this.captions, this.advanceDetail);
  }

  back(): void {
    this.location.back();
  }

  sortTable(value: string): void {
    this.queryParams.sorts = value;
    this.getAdvanceById();
  }

  private getAdvanceById(params = this.queryParams): void {
    this.loading.set(true);
    if (this.advancePaymentSub && !this.advancePaymentSub.closed) {
      this.advancePaymentSub.unsubscribe();
    }
    this.advancePaymentSub = this.advanceService
      .getAdvanceById(this.id, params)
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(res => {
        if (res.status) {
          this.advanceDetail = res.data;
          this.paginate = res.meta.pagination;
        }
      });
  }

  private handleQueryParams(): void {
    this.activatedRoute.queryParams.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(res => {
      restoreQueryParamsIfEmpty(this.captionKey, this.activatedRoute, this.router);
      this.params = res;

      this.queryParams.page = res['page'];
      this.queryParams.pageSize = res['pageSize'];

      const params = parseFilterParams(res, this.queryParams, this.captions);

      if (this.params['module'] && this.captionKey !== this.params['module']) {
        this.queryParams.page = 1;
      } else {
        this.queryParams.module = this.captionKey;
      }
      this.getAdvanceById(params);
    });
  }
}
