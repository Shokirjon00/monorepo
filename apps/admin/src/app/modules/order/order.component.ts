import { AfterViewInit, Component, inject, OnInit, viewChild } from '@angular/core';
import { ActionsComponent, EmHeaderComponent, EMPaginationComponent, TableComponent } from '@eskhata/ui';
import { IPaginate } from '@eskhata/util';
import { ICaption } from '@eskhata/util';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { IHeader } from '@eskhata/util';
import { IFilterParams } from '@eskhata/util';
import { DestroyableComponent } from '@eskhata/util';
import { HeaderService } from '@core/services/header.service';
import { finalize, takeUntil } from 'rxjs';
import { setDefaultFilterValue } from '@eskhata/util';
import { parseFilterParams } from '@core/utils/filter-util';
import { OrderService } from '@modules/order/services/order.service';
import { IOrder } from '@modules/order/interfaces/order';
import { IAction } from '@eskhata/util';
import { NgxPermissionsService } from 'ngx-permissions';
import { MatDialog } from '@angular/material/dialog';
import { ChangeOrderStatusComponent } from '@shared/dialogs/change-order-status/change-order-status.component';
import {
  ErrorOrderStatusDialogComponent
} from '@shared/dialogs/error-order-status-dialog/error-order-status-dialog.component';
import { OrderConstants } from "@modules/order/order.constants";

@Component({
  standalone: true,
  selector: 'em-order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.scss'],
  imports: [
    TableComponent,
    ActionsComponent,
    EmHeaderComponent,
    EMPaginationComponent
  ],
  providers: [OrderService]
})
export class OrderComponent extends DestroyableComponent implements OnInit, AfterViewInit {
  readonly table = viewChild(TableComponent);
  loading: boolean;
  actionStatus: boolean = false;
  orderIds: string[];
  orders: IOrder[];
  actions: IAction[] = OrderConstants.ORDER;
  columns = OrderConstants.ORDER_COLUMNS;
  captionKey = 'orders';
  params: Params = {};
  header: IHeader = {
    title: 'Заказы',
    isFilter: true,
    tabShow: false
  }
  key: string;
  paginate: IPaginate | any;

  private readonly route = inject(ActivatedRoute);
  private readonly orderService = inject(OrderService);
  private readonly store = inject(HeaderService);
  private readonly router = inject(Router);
  private readonly headerService = inject(HeaderService);
  private readonly permissionService = inject(NgxPermissionsService);
  private readonly dialog = inject(MatDialog);

  private filterParams: IFilterParams = {
    page: this.route.snapshot.queryParams['Page'] || 1,
    sorts: '',
    pageSize: 15
  };

  constructor() {
    super();
    this.initTabData();
  }

  ngOnInit(): void {
    this.initRouteParams();
  }

  ngAfterViewInit(): void {
    this.columns.map((x: any, i: any,) => ({
      key: x,
      index: i,
      isSelected: true
    } as ICaption));
    this.table().render(this.columns, this.orders)
  }

  showDetail(orderId: string): void {
    if (!this.permissionService.getPermission('OrderHistoryList')) return;
    this.router.navigate(['/order/detail/', orderId, 'order-detail-list']).catch();
  }

  sortTable(value: string): void {
    this.filterParams.sorts = value;
    this.getOrders();
  }

  link(dataDetail: { dataSourceId: string, fieldName: string }): void {
    if (dataDetail.fieldName === 'companyName') {
      const companyId = this.orders.find(item => item.id === dataDetail.dataSourceId).companyId;
      this.router.navigate(['clients/company', companyId]).catch();
    }
  }

  changeOrderStatus(): void {
    this.dialog.open(ChangeOrderStatusComponent, {
      width: '400px',
    })
      .afterClosed().subscribe(res => {
      if (res) {
        this.loading = true;
        this.orderService.changeOrderStatus({ids: this.orderIds, statusId: res.statusId})
          .pipe(
            finalize(() => this.loading = false),
            takeUntil(this.destroyed$)
          )
          .subscribe((res: any) => {
            this.getOrders();
            this.headerService.clearTableItemIds$.next(true);
            this.orderIds = [];
            this.actionStatus = this.orderIds?.length > 0;
            if (res.data.invoiceIds?.length) {
              this.dialog.open(ErrorOrderStatusDialogComponent, {width: '400px', data: res.data.invoiceIds});
            }
          })
      }
    })
  }

  private getOrders(params = this.filterParams): void {
    this.loading = true;
    this.orderService.getOrders(params)
      .pipe(
        finalize(() => this.loading = false),
        takeUntil(this.destroyed$)
      )
      .subscribe(res => {
        if (res.status) {
          this.orders = res.data;
          this.paginate = res.meta.pagination;
          this.store.setPage(this.paginate);
        }
      })
  }

  private initTabData(): void {
    this.headerService.getTableItemIds()
      .pipe(takeUntil(this.destroyed$))
      .subscribe(ids => {
        this.orderIds = ids;
        this.actionStatus = ids?.length > 0;
      });
  }

  private initRouteParams(): void {
    this.route.queryParams
      .pipe(takeUntil(this.destroyed$))
      .subscribe((res: Params) => {
        this.params = res;
        this.filterParams = setDefaultFilterValue(res, this.captionKey);
        const params = parseFilterParams(res, this.filterParams, this.columns);
        this.getOrders(params);
        this.router.navigate([],
          {
            relativeTo: this.route,
            queryParams: this.params
          }).catch();
      });
  }
}
