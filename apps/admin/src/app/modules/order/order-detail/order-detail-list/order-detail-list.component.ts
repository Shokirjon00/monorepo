import { AfterViewInit, Component, DestroyRef, inject, OnInit, signal, viewChild } from '@angular/core';
import { EMPaginationComponent } from "@shared/components/em-pagination/pagination.component";
import { EmHeaderComponent } from "@shared/components/em-header/em-header.component";
import { TableComponent } from "@shared/components/table/table.component";
import { IOrderHistory } from "@modules/order/interfaces/order-history";
import { ICaption, IFilterParams, IPaginate } from "@core/interfaces";
import { OrderDetailConstants } from "@modules/order/order-detail/order-detail.constants";
import { ActivatedRoute, Params, Router } from "@angular/router";
import { OrderService } from "@modules/order/services/order.service";
import { finalize } from "rxjs";
import { isEmptyObject, parseFilterParams, setDefaultFilterValue } from "@core/utils";
import { ITab } from "@core/interfaces/header.interface";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { ActionsComponent } from "@shared/components/actions/actions.component";
import { IAction } from "@shared/components/actions/actions.interface";
import { ToastEnum } from '@eskhata/util';
import { MessageService } from "@core/services";
import { ToastComponent } from "@shared/components/toast/toast.component";

@Component({
  selector: 'em-order-detail-list',
  standalone: true,
  imports: [
    EMPaginationComponent,
    EmHeaderComponent,
    TableComponent,
    ActionsComponent,
    ToastComponent
  ],
  templateUrl: './order-detail-list.component.html',
  styleUrl: './order-detail-list.component.scss'
})
export class OrderDetailListComponent implements OnInit, AfterViewInit {
  readonly table = viewChild(TableComponent);
  loading = signal(false);
  actions: IAction[] = OrderDetailConstants.ORDER_DETAIL_ACTIONS;
  orderHistory: IOrderHistory[];
  paginate: IPaginate | any;
  key: string;
  tabMenuItems: ITab[];
  columns = OrderDetailConstants.ORDER_DETAIL_COLUMNS;
  captionKey = 'order-history';
  params: Params = {};

  protected orderId: string;
  private readonly route = inject(ActivatedRoute);
  private readonly orderService = inject(OrderService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly messageService = inject(MessageService);
  private filterParams: IFilterParams = {
    page: this.route.snapshot.queryParams['Page'] || 1,
    sorts: '',
    pageSize: 15
  };

  ngOnInit(): void {
    this.orderId = this.route.snapshot.parent.params['id'];
    this.tabMenuItems = OrderDetailConstants.getHeaderTabs(this.orderId)
    this.initRouteParams();
  }

  ngAfterViewInit(): void {
    this.columns.map((x: any, i: any,) => ({
      key: x,
      index: i,
      isSelected: true
    } as ICaption));
    this.table().render(this.columns, this.orderHistory);
  }

  sortTable(value: string): void {
    this.filterParams.sorts = value;
    this.getOrderDetail()
  }

  private getOrderDetail(params = this.filterParams): void {
    this.loading.set(true);
    this.orderService.getOrderHistoryList(params, this.orderId)
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(res => {
        if (res.status) {
          this.orderHistory = res.data;
          this.paginate = res.meta.pagination;
        }
      });
  }

  resendWebhook(): void {
    this.loading.set(true);
    this.orderService.changeWebhook({ orderId: this.orderId })
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(res => {
        this.messageService.add({
          severity: res.status ? ToastEnum.SUCCESS : ToastEnum.ERROR,
          summary: res.message
        });
      });
  }

  private initRouteParams(): void {
    this.route.queryParams
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res: Params) => {
        if (!isEmptyObject(res)) {
          this.filterParams = setDefaultFilterValue(res, this.captionKey);
          const params = parseFilterParams(res, this.filterParams, this.columns);
          this.getOrderDetail(params);
        }
      });
  }
}
