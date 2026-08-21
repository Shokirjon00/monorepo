import { AfterViewInit, Component, DestroyRef, inject, OnInit, signal, viewChild } from '@angular/core';
import { EmHeaderComponent, EMPaginationComponent, EskhataBankLoaderComponent, TableComponent } from '@eskhata/ui';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { IFilterParams, IPaginate } from '@core/interfaces';
import { ICaption } from '@eskhata/util';
import { NgxPermissionsService } from 'ngx-permissions';
import { finalize } from 'rxjs';
import { setDefaultFilterValue } from '@eskhata/util';
import { parseFilterParams } from '@core/utils/filter-util';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IOrder } from '@modules/order/interfaces/order';
import { OrderConstants } from '@modules/order/order.constants';
import { OrderService } from '@modules/order/services/order.service';
import { isPhone } from '@core/helper';
import { OrderMobileCardComponent } from '@modules/order/order-mobile-card/order-mobile-card.component';

@Component({
  selector: 'em-order',
  imports: [
    EMPaginationComponent,
    TableComponent,
    EmHeaderComponent,
    EskhataBankLoaderComponent,
    OrderMobileCardComponent,
  ],
  templateUrl: './order.component.html',
  styleUrl: './order.component.scss',
  providers: [OrderService],
})
export class OrderComponent implements OnInit, AfterViewInit {
  readonly table = viewChild(TableComponent);
  loading = signal(false);
  orders: IOrder[];
  columns = OrderConstants.ORDER_COLUMNS;
  captionKey = 'orders';
  params: Params = {};
  key: string;
  paginate: IPaginate | any;
  readonly isMobile = isPhone();
  private readonly route = inject(ActivatedRoute);
  private readonly orderService = inject(OrderService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  private filterParams: IFilterParams = {
    page: this.route.snapshot.queryParams['Page'] || 1,
    sorts: '',
    pageSize: 15,
  };

  ngOnInit(): void {
    this.initRouteParams();
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
    this.table().render(this.columns, this.orders);
  }

  showDetail(id: string): void {
    this.router.navigate(['order', id]).catch();
  }

  sortTable(value: string): void {
    this.filterParams.sorts = value;
    this.getOrders();
  }

  private getOrders(params = this.filterParams): void {
    this.loading.set(true);
    this.orderService
      .getOrders(params)
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(res => {
        if (res.status) {
          this.orders = res.data;
          this.paginate = res.meta.pagination;
        }
      });
  }

  private initRouteParams(): void {
    this.route.queryParams.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((res: Params) => {
      this.params = res;
      this.filterParams = setDefaultFilterValue(res, this.captionKey);
      const params = parseFilterParams(res, this.filterParams, this.columns);
      this.getOrders(params);
      this.router
        .navigate([], {
          relativeTo: this.route,
          queryParams: this.params,
        })
        .catch();
    });
  }
}
