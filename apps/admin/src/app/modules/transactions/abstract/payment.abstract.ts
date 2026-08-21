import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { finalize, tap } from 'rxjs/operators';
import { takeUntil } from 'rxjs';
import { DestroyableComponent } from '@eskhata/util';
import { MessageService } from '@core/services';
import { IPaymentContinue, IPaymentDetail } from '@modules/transactions/payments/interfaces';
import { ToastEnum } from '@eskhata/util';
import {
  PaymentConfirmDialogComponent
} from "../payments/shared/payment-confirm-dialog/payment-confirm-dialog.component";
import {
  PaymentContinueDialogComponent
} from "../payments/shared/payment-continue-dialog/payment-continue-dialog.component";
import { ActivatedRoute } from "@angular/router";
import { inject, signal, WritableSignal } from "@angular/core";
import { PaymentsServiceBase } from "@modules/transactions/abstract/payment-service";

export abstract class AbstractPaymentComponent<T> extends DestroyableComponent {
  protected readonly loading: WritableSignal<boolean> = signal(false);
  isContinueDisabled = signal(false);
  protected readonly paymentId: string | any;
  protected paymentDetail: IPaymentDetail | any;
  protected selectedItemsExist: boolean = false;
  protected readonly messageService: MessageService;
  protected dialog: MatDialog = inject(MatDialog);
  protected sanitizer: DomSanitizer = inject(DomSanitizer);
  protected route: ActivatedRoute = inject(ActivatedRoute);

  protected constructor(
    protected readonly service: PaymentsServiceBase<T>
  ) {
    super();
    this.messageService = inject(MessageService);
    this.paymentId = this.route.snapshot.parent?.params['id'];
    this.getDetail();
  }

  paymentContinue(): void {
    this.loading.set(true);
    this.service.getPaymentContinueProcess(this.paymentId)
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntil(this.destroyed$)
      )
      .subscribe(res => {
        if (res.status) {
          this.showContinueDialog(res.data);
        }
      });
  }

  syncStatus(paymentIds: string[]): void {
    this.loading.set(true);
    this.service.syncStatus(paymentIds)
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntil(this.destroyed$)
      )
      .subscribe(res => {
        if (res.status) {
          this.showContinueDialog(res.data);
        } else {
          this.messageService.add({severity: ToastEnum.ERROR, summary: res.message});
        }
      });
  }

  syncStatusHandler(paymentIds: string[]): void {
    if (!this.selectedItemsExist) {
      return;
    }
    this.syncStatus(paymentIds);
  }

  checkPaymentRefundStatus(): void {
    this.loading.set(true);
    this.service.checkPaymentRefund(this.paymentId)
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntil(this.destroyed$))
      .subscribe(res => {
        if (res.status) {
          this.openPaymentRefundDialog();
        } else {
          this.messageService.add({severity: ToastEnum.ERROR, summary: res.message});
        }
      });
  }

  protected showContinueDialog(data: IPaymentContinue): void {
    this.dialog.open(PaymentContinueDialogComponent, {
      disableClose: true,
      panelClass: 'custom-modalbox',
      data
    });
  }

  protected openPaymentRefundDialog(): void {
    this.dialog.open(PaymentConfirmDialogComponent, {
      disableClose: true,
      panelClass: 'custom-modalbox',
      maxWidth: '30vw',
      data: {
        id: this.paymentId,
        amount: this.paymentDetail?.fromAmount,
        title: this.messageText(),
        successButtonText: 'Да',
        cancelButtonText: 'Нет'
      },
    })
      .afterClosed()
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => res.status && this.messageService.add({severity: ToastEnum.SUCCESS, summary: res}));
  }

  protected getDetail(): void {
    this.loading.set(true);
    this.service.getDetail(this.paymentId)
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntil(this.destroyed$))
      .subscribe(res => {
        if (res.status) {
          this.paymentDetail = res.data;
        }
      });
  }

  private messageText(): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(
      `Вы действительно хотите возвратить на сумму
            <span style="font-weight: 700">${this.paymentDetail.fromAmount}</span> сомони?`)
  }
}
