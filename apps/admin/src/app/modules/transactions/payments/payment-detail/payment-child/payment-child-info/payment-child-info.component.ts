import { Component, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { finalize, takeUntil } from 'rxjs';
import { PaymentsService } from '@modules/transactions/services/payments.service';
import { CommonModule } from '@angular/common';
import { DateTimePipe } from '@eskhata/util';
import { DestroyableComponent } from '@eskhata/util';
import { IPaymentDetail } from '@modules/transactions/payments/interfaces';
import { IHeader } from '@core/interfaces';
import { ActivatedRoute, Router } from '@angular/router';
import { ActionsComponent, EmHeaderComponent } from '@eskhata/ui';
import { IAction } from '@eskhata/util';
import {
  PaymentsInfoConstants
} from "@modules/transactions/payments/payment-detail/payment-info/payment-info.constants";
import { MessageService } from "@core/services";
import { ToastEnum } from '@eskhata/util';
import { ConfirmDialogComponent } from "@shared/dialogs/confirm-dialog/confirm-dialog.component";
import { MatDialog } from "@angular/material/dialog";
import {
  PaymentInfoService
} from "@modules/transactions/payments/payment-detail/payment-info/service/payment-info.service";
import {
  PaymentsChildInfoConstants
} from "@modules/transactions/payments/payment-detail/payment-child/payment-child-info/payment-child-info.constants";

@Component({
  standalone: true,
  selector: 'em-payment-info',
  templateUrl: './payment-child-info.component.html',
  styleUrls: ['./payment-child-info.component.scss'],
  providers: [PaymentsService, PaymentInfoService],
  imports: [
    CommonModule,
    DateTimePipe,
    EmHeaderComponent,
    ActionsComponent,
  ]
})
export class PaymentChildInfoComponent extends DestroyableComponent implements OnInit {
  paymentDetail: IPaymentDetail;
  actions: IAction[] = PaymentsChildInfoConstants.PAYMENT_CHILD_INFO_ACTIONS;
  loading: WritableSignal<boolean> = signal(false);
  protected messageService = inject(MessageService);
  protected dialog: MatDialog = inject(MatDialog);
  private service = inject(PaymentsService);
  private paymentService = inject(PaymentInfoService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private paymentChildId = this.route.snapshot.parent.params['id'];

  ngOnInit(): void {
    this.getDetail();
  }

  navigateToJobLog(): void {
    this.router.navigate(['job-log/main-journal'], {queryParams: {paymentId: this.paymentChildId}})
      .catch();
  }

  navigateToArchiveJournal(): void {
    this.router.navigate(['job-log/archives-journal'], {queryParams: {paymentId: this.paymentChildId}})
      .catch();
  }

  paymentUnlock(paymentDetail: IPaymentDetail): void {
    if (!this.paymentDetail.isLock) {
      this.messageService.add({severity: ToastEnum.INFO, summary: 'Платеж уже разблокирован'})
      return;
    }

    this.dialog.open(ConfirmDialogComponent, {
      disableClose: true,
      panelClass: 'custom-modalbox',
      data: {
        title: 'Вы действительно хотите разблокировать?',
        successButtonText: 'Да',
        cancelButtonText: 'Нет'
      },
      maxWidth: '30vw'
    })
      .afterClosed()
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => {
        if (res) {
          this.changeStatusPayment(paymentDetail.id);
        }
      });
  }

  private changeStatusPayment(paymentId: string): void {
    this.loading.set(true);
    this.paymentService.unlockPayment(paymentId)
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntil(this.destroyed$)
      )
      .subscribe(res => {
        this.messageService.add({severity: res.status ? ToastEnum.SUCCESS : ToastEnum.ERROR, summary: res.message});
        if (res.status) {
          this.getDetail()
        }
      })
  }

  private getDetail(): void {
    this.service.getDetail(this.paymentChildId)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => this.paymentDetail = res.data);
  }
}
