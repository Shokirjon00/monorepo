import { Component, inject, OnInit, DestroyRef, signal, computed, effect } from '@angular/core';
import { Location } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EmHeaderComponent } from '@shared/components/em-header/em-header.component';
import { IOrder, OrderAction, OrderActionButton } from '@modules/food/orders/active-orders/interfaces/order.interface';
import { OrdersDetailService } from '@modules/food/orders/active-orders/order-action-modal/services/active-orders.service';
import {
  ORDER_ACTION_BUTTONS,
  ORDER_STATUSES,
} from '@modules/food/orders/active-orders/order-action-modal/order-detail.constants';
import { MessageService } from '@core/services/message.service';
import { ToastModule } from '@shared/components/toast/toast.module';
import { ToastEnum } from '@core/enums/toast-enum';
import { finalize, timer } from 'rxjs';
import { SvgIconComponent } from 'angular-svg-icon';
import { NgxPermissionsModule } from 'ngx-permissions';
import { EskhataBankLoaderComponent } from '@shared/components/eskhata-bank-loader/eskhata-bank-loader.component';
import { MatDialog } from '@angular/material/dialog';
import {
  CancelOrderModalComponent,
} from '@modules/food/orders/active-orders/cancel-order-modal/cancel-order-modal.component';
import {
  CancelOrderModalResult,
  IOrderRefusalReason,
} from '@modules/food/orders/active-orders/interfaces/active-orders.interface';
import { filter, switchMap, tap } from 'rxjs/operators';

@Component({
  standalone: true,
  selector: 'em-order-detail',
  templateUrl: './order-detail.component.html',
  styleUrls: ['./order-detail.component.scss'],
  imports: [
    MatButtonModule,
    MatDividerModule,
    EmHeaderComponent,
    ToastModule,
    SvgIconComponent,
    NgxPermissionsModule,
    EskhataBankLoaderComponent,
  ],
  providers: [OrdersDetailService],
})
export class OrderDetailComponent implements OnInit {
  readonly order = signal<IOrder | null>(null);
  loading = signal<boolean>(false);
  loadingText = signal<string | null>(null);
  readonly actionButtons = ORDER_ACTION_BUTTONS;
  readonly orderStatuses = ORDER_STATUSES;
  fileStorageUrl: string;
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly service = inject(OrdersDetailService);
  private readonly messageService = inject(MessageService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dialog = inject(MatDialog);
  private readonly orderId = this.activatedRoute.snapshot.params['id'];
  private readonly location = inject(Location);

  readonly orderStatusName = computed(() => {
    return this.order()?.orderStatusGroup?.name?.toUpperCase() ?? null;
  });

  readonly visibleStatuses = computed(() => {
    const order = this.order();
    if (!order) return [];

    const hasDelivery = !!order.deliveryAddress;

    return this.orderStatuses.filter(status =>
      status.name === 'DELIVERING' ? hasDelivery : true
    );
  });

  readonly progressPercent = computed(() => {
    const statuses = this.visibleStatuses();
    const current = this.orderStatusName();
    if (!current) return 0;

    const currentIndex = statuses.findIndex(s => s.name === current);
    const maxIndex = statuses.length - 1;

    if (currentIndex <= 0) return 0;
    return (currentIndex / maxIndex) * 100;
  });

  readonly isCancelled = computed(() =>
    this.orderStatusName() === 'CANCELED'
  );

  readonly isCompleted = computed(() =>
    this.orderStatusName() === 'COMPLETED'
  );

  readonly canCancelOrder = computed(() =>
    this.order()?.orderStatus?.name === 'CONFIRMED'
  );

  readonly canShowClientInfo = computed(() =>
    this.orderStatusName() !== 'NEW'
  );

  ngOnInit(): void {
    this.getDetail();
  }

  performAction(action: OrderAction): void {
    this.handleOrderAction(action);
  }

  cancelOrder(): void {
    this.service.getOrderRefusal().pipe(
        tap(res => {
          if (!res?.status) {
            this.messageService.add({
              severity: ToastEnum.ERROR,
              summary: res?.message || 'Ошибка загрузки причин'
            });
          }
        }),
        filter(res => res?.status),
        switchMap(res =>
        this.openCancelDialog((res?.data || []) as IOrderRefusalReason[])
      ),
        filter((result: CancelOrderModalResult) => !!result?.confirmed && !!result.reason),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(result => {
        this.handleOrderAction('cancel', {
          reasonId: result.reason!.id,
          productVariantIds: result.items?.map(i => i.productVariantId)
        });
      });
  }

  private openCancelDialog(
    reasons: IOrderRefusalReason[]
  ) {
    return this.dialog.open(CancelOrderModalComponent, {
      disableClose: true,
      maxWidth: '660px',
      width: '90vw',
      data: {
        orderSequence: this.order()?.sequence,
        reasons,
        items: this.order()?.items || []
      },
    }).afterClosed();
  }

  back(): void {
    this.location.back();
  }

  getButtonLabel(btn: OrderActionButton, order: any): string {
    return typeof btn.label === 'function' ? btn.label(order) : btn.label;
  }

  isStatusActive(status: { name: string }): boolean {
    return this.orderStatusName() === status.name;
  }

  isStatusCompleted(status: { name: string }): boolean {
    const statuses = this.visibleStatuses();
    const current = this.orderStatusName();

    if (!current) return false;

    const statusIndex = statuses.findIndex(s => s.name === status.name);
    const currentIndex = statuses.findIndex(s => s.name === current);

    return statusIndex !== -1 && currentIndex !== -1 && statusIndex < currentIndex;
  }

  private getDetail(): void {
    this.service
      .getActiveOrdersDetail(this.orderId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(res => {
        if (res && res.data) {
          this.order.set(res.data);
          this.fileStorageUrl = res.meta.file['url'];
        }
      });
  }

  private handleOrderAction(
    action: OrderAction,
    payload?: { reasonId?: string; productVariantIds?: string[] }
  ): void {
    const orderId = this.order()?.id;
    if (!orderId) return;

    this.loading.set(true);

    this.service
      .performOrderAction(orderId, action, payload)
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (res: any) => {
          const severity = res?.status ? ToastEnum.SUCCESS : ToastEnum.ERROR;
          this.messageService.add({
            severity,
            summary: res?.message || 'Операция успешно выполнена',
          });

          if (res?.status) this.getDetail();
        },
        error: () => this.messageService.add({
          severity: ToastEnum.ERROR,
          summary: 'Ошибка соединения'
        })
      });
  }

  private readonly autoRefresh = effect(() => {
    const status = this.order()?.orderStatus?.name;

    const texts: Record<string, string> = {
      ACCEPTED: 'Зачисляем деньги на Ваш счет',
      CANCEL_IN_PROCESS: 'Заказ отменяется',
    };

    if (texts[status!]) {
      this.loading.set(true);
      this.loadingText.set(texts[status!]);

      timer(5_000)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => {
          this.getDetail();
          this.loading.set(false);
          this.loadingText.set(null);
        });
    }
  });
}
