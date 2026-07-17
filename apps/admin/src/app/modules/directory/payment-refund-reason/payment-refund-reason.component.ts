import { AfterViewInit, Component, inject, OnInit, viewChild } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { DestroyableComponent } from '@core/abstract/destroyable.component';
import { finalize, takeUntil } from 'rxjs';
import { TableComponent } from '@shared/components/table/table.component';
import { ICaption, IRowAction } from '@core/interfaces/table.interface';
import { IAction } from '@shared/components/actions/actions.interface';
import { ITab } from '@core/interfaces/header.interface';
import { IPaginate } from '@eskhata/util';
import { IFilterParams } from '@core/interfaces/filter-params.interface';
import { parseFilterParams } from '@core/utils/filter-util';
import { setDefaultFilterValue } from '@core/utils/route-param-parse';
import {
  PaymentRefundReasonService
} from '@modules/directory/payment-refund-reason/services/payment-refund-reason.service';
import {
  IPaymentRefundReason
} from '@modules/directory/payment-refund-reason/interfaces/payment-refund-reason.interface';
import { DirectoryConstants } from "@modules/directory/directory.constants";
import { PaymentRefundReasonConstants } from "@modules/directory/payment-refund-reason/payment-refund-reason.constants";
import { ActionsComponent } from "@shared/components/actions/actions.component";
import { EMPaginationComponent } from "@shared/components/em-pagination/pagination.component";
import { EmHeaderComponent } from "@shared/components/em-header/em-header.component";


@Component({
  standalone: true,
  selector: 'em-payment-refund-reason',
  templateUrl: './payment-refund-reason.component.html',
  styleUrls: ['./payment-refund-reason.component.scss'],
  providers: [PaymentRefundReasonService],
  imports: [TableComponent, ActionsComponent, EMPaginationComponent, EmHeaderComponent]
})
export class PaymentRefundReasonComponent extends DestroyableComponent implements OnInit, AfterViewInit {
  readonly table = viewChild(TableComponent);
  paymentRefundReasons: IPaymentRefundReason[];
  loading: boolean;
  columns = PaymentRefundReasonConstants.PAYMENTREFUNDREASON_COLUNNS
  tabMenuItems: ITab[] = DirectoryConstants.HEADER_TABS
  tableActions: IRowAction[] = PaymentRefundReasonConstants.TABLE_ACTIONS;
  captionKey = 'refund-reason';
  actions: IAction[] = PaymentRefundReasonConstants.REFUND_REASON_ACTIONS
  paginate: IPaginate;
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(PaymentRefundReasonService);
  filterParams: IFilterParams = {
    page: this.route.snapshot.queryParams['Page'] || 1,
    sorts: '',
    pageSize: 15
  };
  params: Params = {};

  ngOnInit(): void {
    this.route.queryParams
      .pipe(takeUntil(this.destroyed$))
      .subscribe((res: Params) => {
        this.params = res;
        this.filterParams = setDefaultFilterValue(res, this.captionKey);
        const params = parseFilterParams(res, this.filterParams, this.columns);
        this.getPaymentRefundReasons(params);
        this.router.navigate([],
          {
            relativeTo: this.route,
            queryParams: this.params
          }).catch();
      })
  }

  ngAfterViewInit(): void {
    this.columns.map((x: any, i: any,) => ({
      key: x,
      index: i,
      isSelected: true
    } as ICaption));
    this.table().render(this.columns, this.paymentRefundReasons)
  }

  detail(refundReasonId: string): void {
    this.router.navigate(['directory/refund-reason/info', refundReasonId])
      .catch()
  }

  edit(refundReasonId: string): void {
    this.router.navigate(['directory/refund-reason/edit', refundReasonId])
      .catch()
  }

  sortTable(value: string): void {
    this.filterParams.sorts = value;
    this.getPaymentRefundReasons()
  }

  private getPaymentRefundReasons(params = this.filterParams): void {
    this.loading = true
    this.service.getPaymentRefundReasons(params)
      .pipe(
        finalize(() => this.loading = false),
        takeUntil(this.destroyed$)
      )
      .subscribe(res => {
        if (res.status) {
          this.paymentRefundReasons = res.data;
          this.paginate = res.meta.pagination;
        }
      })
  }
}
