import { AfterViewInit, Component, DestroyRef, inject, OnInit, signal, viewChild } from '@angular/core';
import { DatePipe } from "@angular/common";
import { EmHeaderComponent, EMPaginationComponent, EskhataBankLoaderComponent, TableComponent } from '@eskhata/ui';
import { NgxPermissionsModule } from "ngx-permissions";
import { ICaption, IFilterParams, IPaginate } from "@core/interfaces";
import { ActivatedRoute, Params, Router } from "@angular/router";
import { isPhone } from "@core/helper";
import { MessageService } from '@eskhata/data-access';
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { ToastEnum } from '@eskhata/util';
import { ActiveOrdersConstants } from "@modules/food/orders/active-orders/active-orders.constants";
import { OrdersService } from "@modules/food/orders/active-orders/services/active-orders.service";
import { IOrders } from "@modules/food/orders/active-orders/interfaces/active-orders.interface";
import { finalize } from "rxjs";
import { setDefaultFilterValue } from '@eskhata/util';
import { parseFilterParams } from "@core/utils/filter-util";
import { restoreQueryParamsIfEmpty } from "@core/utils/restore-query-params";

@Component({
  standalone: true,
  selector: 'em-active-orders',
  templateUrl: './active-orders.component.html',
  styleUrl: './active-orders.component.scss',
  imports: [
    DatePipe,
    EMPaginationComponent,
    EmHeaderComponent,
    EskhataBankLoaderComponent,
    NgxPermissionsModule,
    TableComponent
  ],
  providers: [OrdersService]
})
export class ActiveOrdersComponent implements OnInit, AfterViewInit {
  readonly table = viewChild(TableComponent);

  loading = signal(false);
  orders: IOrders[];
  field: string;
  filterParams: string;
  tabMenuItems = ActiveOrdersConstants.HEADER_TABS;
  columns = ActiveOrdersConstants.ORDERS_COLUMNS;
  paginate: IPaginate | any;
  params: Params = {};
  captionKey = 'orders';
  showScrollButton: boolean = false;

  readonly isMobile = isPhone();
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(OrdersService);
  private readonly messageService = inject(MessageService);
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
    this.table().render(this.columns, this.orders)
  }

  sortTable(value: string): void {
    const isDesc = value.startsWith('-');
    let field = value.replace('-', '');
    field = field.includes('.') ? field.split('.')[0] : field;

    if (field === 'totalPrice') {
      field = 'price';
    }

    this.queryParams.orderBy = isDesc ? `${field} desc` : field;

    this.getActiveOrders();
  }

  detail(ordersId: string): void {
    this.router.navigate(['food/orders/active/info', ordersId]).catch();
  }

  private getActiveOrders(params = this.queryParams): void {
    this.loading.set(true);
    this.service.getActiveOrders(params)
        .pipe(
            finalize(() => this.loading.set(false)),
            takeUntilDestroyed(this.destroyRef))
        .subscribe(res => {
          if (res.status) {
            this.orders = res.data;
            this.paginate = res.meta.pagination;
          } else {
            this.messageService.add({severity: ToastEnum.ERROR, summary: res.message})
          }
        })
  }

  private initRouteParams(): void {
    this.route.queryParams
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((res: Params) => {
          let params = {...res}
          params['IsArchived'] = 'false';
          restoreQueryParamsIfEmpty(this.captionKey, this.route, this.router);
          this.queryParams = setDefaultFilterValue(params, this.captionKey);
          this.queryParams.filter = parseFilterParams(params, this.queryParams, this.columns, []).filters;
          delete this.queryParams.filters;
          this.getActiveOrders();
        });
  }

}
