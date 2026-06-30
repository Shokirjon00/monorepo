import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { EmHeaderComponent } from "@shared/components/em-header/em-header.component";
import { ActivatedRoute } from "@angular/router";
import { historyOrdersService } from "@modules/food/orders/history/services/history.service";
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Location } from '@angular/common';
import { EskhataBankLoaderComponent } from '@shared/components/eskhata-bank-loader/eskhata-bank-loader.component';
import { NgxPermissionsModule } from 'ngx-permissions';
import { SvgIconComponent } from 'angular-svg-icon';
import { ToastComponent } from '@shared/components/toast/toast.component';
import { IOrder } from '@modules/food/orders/active-orders/interfaces/order.interface';
import { ORDER_STATUSES } from '@modules/food/orders/active-orders/order-action-modal/order-detail.constants';

@Component({
  selector: 'em-history-info',
  standalone: true,
  imports: [
    EmHeaderComponent,
    EskhataBankLoaderComponent,
    NgxPermissionsModule,
    SvgIconComponent,
    ToastComponent,
  ],
  templateUrl: './history-info.component.html',
  styleUrl: './history-info.component.scss',
  providers: [historyOrdersService],
})
export class HistoryInfoComponent implements OnInit {
  readonly order = signal<IOrder | null>(null);
  loading = signal<boolean>(false);
  fileStorageUrl: string;
  private activatedRoute = inject(ActivatedRoute);
  private readonly service = inject(historyOrdersService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly orderId = this.activatedRoute.snapshot.params['id'];
  private readonly location = inject(Location);
  readonly orderStatuses = ORDER_STATUSES;

  readonly visibleStatuses = computed(() => {
    if (!this.isCompleted()) return [];
    return this.orderStatuses;
  });

  isStatusCompleted(status: { name: string }): boolean {
    if (!this.isCompleted()) return false;

    const statuses = this.orderStatuses;
    const currentIndex = statuses.findIndex(s => s.name === 'COMPLETED');
    const statusIndex = statuses.findIndex(s => s.name === status.name);

    return statusIndex <= currentIndex;
  }

  readonly orderStatusName = computed(() => {
    return this.order()?.orderStatusGroup?.name?.toUpperCase() ?? null;
  });

  readonly isCancelled = computed(() =>
    this.orderStatusName() === 'CANCELED'
  );

  readonly isCompleted = computed(() =>
    this.orderStatusName() === 'COMPLETED'
  );

  back(): void {
    this.location.back();
  }

  ngOnInit(): void {
    this.service
      .getHistoryById(this.orderId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(res => {
        if (res && res.data) {
          this.order.set(res.data);
          this.fileStorageUrl = res.meta.file['url'];
        }
      });
  }
}
