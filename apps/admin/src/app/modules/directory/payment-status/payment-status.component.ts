import { AfterViewInit, Component, DestroyRef, inject, OnInit, signal, viewChild } from '@angular/core';
import { ActionsComponent, EmHeaderComponent, EMPaginationComponent, TableComponent } from '@eskhata/ui';
import { ITab } from '@eskhata/util';
import { DirectoryConstants } from "@modules/directory/directory.constants";
import { ICaption, IFilterParams, IPaginate, IRowAction } from "@core/interfaces";
import { ActivatedRoute, Params, Router } from "@angular/router";
import { finalize } from "rxjs";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { isEmptyObject, parseFilterParams, setDefaultFilterValue } from "@core/utils";
import { PaymentStatusConstants } from "@modules/directory/payment-status/payment-status.constants";
import { PaymentStatusDetailService } from "@modules/directory/payment-status/services/payment-status.service";
import { IPaymentStatus } from "@modules/directory/payment-status/interfaces/payment-status.interfaces";

@Component({
  selector: 'em-payment-status',
    imports: [
        ActionsComponent,
        EMPaginationComponent,
        EmHeaderComponent,
        TableComponent
    ],
  templateUrl: './payment-status.component.html',
  styleUrl: './payment-status.component.scss',
  providers: [PaymentStatusDetailService]
})
export class PaymentStatusComponent  implements OnInit, AfterViewInit {
  readonly table = viewChild(TableComponent);
  loading = signal(false);
  appealList: IPaymentStatus[];
  tabMenuItems: ITab[] = DirectoryConstants.HEADER_TABS
  actions = PaymentStatusConstants.PAYMENT_STATUS_ACTIONS;
  columns = PaymentStatusConstants.PAYMENT_STATUS_COLUMNS;
  tableActions :IRowAction[] = PaymentStatusConstants.TABLE_ACTIONS;
  paginate: IPaginate | any;
  params: Params = {};
  captionKey = 'payment-status-key';

  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private service = inject(PaymentStatusDetailService);
  private queryParams: IFilterParams = {
    page: this.route.snapshot.queryParams['Page'] || 1,
    pageSize: 15
  };

  ngOnInit(): void {
    this.initRouteParams();
  }

  ngAfterViewInit(): void {
    this.columns.map((x: any, i: any,) => ({
      key: x,
      index: i,
      isSelected: true
    } as ICaption))
    this.table().render(this.columns, this.appealList)
  }

  sortTable(value: string): void {
    this.queryParams.sorts = value;
    this.getAppealList()
  }

  showDetail(categoryId: string): void {
    this.router.navigate(['directory/payment-status-detail/info', categoryId])
      .catch()
  }

  edit(categoryId: string): void {
    this.router.navigate(['directory/payment-status-detail/edit', categoryId])
      .catch()
  }

  private getAppealList(params = this.queryParams): void {
    this.loading.set(true);
    this.service.getPaymentStatus(params)
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(res => {
        if (res.status) {
          this.appealList = res.data
          this.paginate = res.meta.pagination;
        }
      })
  }

  private initRouteParams(): void {
    this.route.queryParams
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res: Params) => {
        if (!isEmptyObject(res)) {
          this.queryParams = setDefaultFilterValue(res, this.captionKey);
          const params = parseFilterParams(res, this.queryParams, this.columns);
          this.getAppealList(params);
        }
      });
  }

}
