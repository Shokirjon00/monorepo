import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { IFilterParams, IPaginate } from '@core/interfaces';
import { ActivatedRoute } from '@angular/router';
import { OrderService } from '@modules/order/services/order.service';
import { EmHeaderComponent } from '@eskhata/ui';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { IOrderDetailHistory } from '@modules/order/interfaces/order-detail-history';
import { DateTimePipe } from '@eskhata/util';

@Component({
  selector: 'em-order-info',
  imports: [EmHeaderComponent, DateTimePipe],
  templateUrl: './order-info.component.html',
  styleUrl: './order-info.component.scss',
  providers: [OrderService],
})
export class OrderInfoComponent implements OnInit {
  loading = signal(false);
  orderHistory: IOrderDetailHistory;
  paginate: IPaginate | any;
  protected orderId: string;
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly orderService = inject(OrderService);
  private readonly destroyRef = inject(DestroyRef);
  private filterParams: IFilterParams = {
    page: this.activatedRoute.snapshot.queryParams['Page'] || 1,
    sorts: '',
    pageSize: 15,
  };

  ngOnInit(): void {
    this.orderId = this.activatedRoute.snapshot.params['id'];
    this.getOrderDetail();
  }

  private getOrderDetail(params = this.filterParams): void {
    this.loading.set(true);
    this.orderService
      .getOrderHistories(params, this.orderId)
      .pipe(
        finalize(() => (this.loading.set(false))),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(res => {
        if (res.status) {
          this.orderHistory = res.data;
        }
      });
  }
}
