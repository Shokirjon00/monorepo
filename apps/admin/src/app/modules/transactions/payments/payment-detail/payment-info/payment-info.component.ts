import { Component, inject } from '@angular/core';
import { PaymentsService } from '@modules/transactions/services/payments.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DateTimePipe } from '@core/pipe/date-time.pipe';
import { ActionsComponent } from '@shared/components/actions/actions.component';
import { ITab } from '@core/interfaces/header.interface';
import { PaymentsDetailConstants } from '../payment-detail.constants';
import { IAction } from '@shared/components/actions/actions.interface';
import { PaymentsInfoConstants } from '../payment-info/payment-info.constants';
import { AbstractPaymentComponent } from '@modules/transactions/abstract/payment.abstract';
import { PaymentInfoService } from './service/payment-info.service';
import { IPaymentDetail } from '@modules/transactions/payments/interfaces';
import { ToastEnum } from '@core/enums/toast-enum';
import { ConfirmDialogComponent } from '@shared/dialogs/confirm-dialog/confirm-dialog.component';
import { finalize, takeUntil } from 'rxjs';
import { EmHeaderComponent } from '@shared/components/em-header/em-header.component';
import { EbLoaderComponent } from "@shared/components/eb-loader/eb-loader.component";

@Component({
  standalone: true,
  selector: 'em-payment-info',
  templateUrl: './payment-info.component.html',
  styleUrls: ['./payment-info.component.scss'],
  providers: [PaymentInfoService, PaymentsService],
  imports: [
    CommonModule,
    DateTimePipe,
    ActionsComponent,
    EmHeaderComponent,
    EbLoaderComponent
  ]
})
export class PaymentInfoComponent extends AbstractPaymentComponent<any> {
  tabMenuItems: ITab[];

  private readonly paymentService = inject(PaymentInfoService);
  private readonly router  = inject(Router);
  actions: IAction[] = PaymentsInfoConstants.getActions(this.paymentId);

  constructor(
    paymentsService: PaymentsService,
  ) {
    super(paymentsService);
    this.tabMenuItems = PaymentsDetailConstants.getHeaderTabs(this.paymentId);
  }

  navigateToJobLog(): void {
    this.router.navigate(['job-log/main-journal'], { queryParams: { paymentId: this.paymentId } }).catch();
  }

  navigateToArchiveJournal(): void {
    this.router.navigate(['job-log/archives-journal'], { queryParams: { paymentId: this.paymentId } }).catch();
  }

  paymentUnlock(paymentDetail: IPaymentDetail): void {
    if (!this.paymentDetail.isLock) {
      this.messageService.add({ severity: ToastEnum.INFO, summary: 'Платеж уже разблокирован' })
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
        this.messageService.add({ severity: res.status ? ToastEnum.SUCCESS : ToastEnum.ERROR, summary: res.message });
        if (res.status) {
          this.getDetail()
        }
      })
  }

}
