import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { EmHeaderComponent } from "@shared/components/em-header/em-header.component";
import { ITab } from "@core/interfaces/header.interface";
import { ActivatedRoute } from "@angular/router";
import { OrderDetailConstants } from "@modules/order/order-detail/order-detail.constants";
import { finalize } from "rxjs";
import { OrderService } from "@modules/order/services/order.service";
import { IFilterParams, IPaginate } from "@core/interfaces";
import { IOrderDetailHistory } from "@modules/order/interfaces/order-detail-history";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { DateTimePipe } from "@core/pipe/date-time.pipe";
import { ActionsComponent } from "@shared/components/actions/actions.component";
import { IAction } from "@shared/components/actions/actions.interface";
import { ToastEnum } from '@eskhata/util';
import { MessageService } from "@core/services";
import { ToastComponent } from "@shared/components/toast/toast.component";

@Component({
  selector: 'em-order-detail-histories',
  standalone: true,
  imports: [
    EmHeaderComponent,
    DateTimePipe,
    ActionsComponent,
    ToastComponent
  ],
  templateUrl: './order-detail-histories.component.html',
  styleUrl: './order-detail-histories.component.scss'
})
export class OrderDetailHistoriesComponent implements OnInit {
  tabMenuItems: ITab[];
  loading = signal(false);
  actions: IAction[] = OrderDetailConstants.ORDER_DETAIL_ACTIONS;
  orderHistory: IOrderDetailHistory;
  paginate: IPaginate | any;
  protected orderId: string;
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly orderService = inject(OrderService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly messageService = inject(MessageService);
  private filterParams: IFilterParams = {
    page: this.activatedRoute.snapshot.queryParams['Page'] || 1,
    sorts: '',
    pageSize: 15
  };


  ngOnInit(): void {
    this.orderId =  this.activatedRoute.snapshot.parent.params['id'];
    this.tabMenuItems = OrderDetailConstants.getHeaderTabs(this.orderId);
    this.getOrderDetail()
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

  private getOrderDetail(params = this.filterParams): void {
    this.loading.set(true);
    this.orderService.getOrderHistories(params, this.orderId)
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(res => {
        if (res.status) {
          this.orderHistory = res.data;
        }
      })
  }
}
