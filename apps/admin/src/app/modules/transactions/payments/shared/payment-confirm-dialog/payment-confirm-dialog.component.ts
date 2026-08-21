import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ConfirmDialogModel } from '@shared/dialogs/confirm-dialog/confirm-dialog.component';
import { SimpleSelectListComponent } from '@eskhata/ui';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DestroyableComponent } from '@eskhata/util';
import { finalize, takeUntil } from 'rxjs';
import { ISelect } from '@eskhata/util';
import {
  PaymentRefundReasonService
} from '@modules/directory/payment-refund-reason/services/payment-refund-reason.service';
import { ToastEnum } from '@eskhata/util';
import { MessageService } from '@eskhata/data-access';
import { setValidationErrors } from '@core/validators/set-validation-errors';

import { SharedModule } from '@shared/shared.module';
import { PaymentsService } from '@modules/transactions/services/payments.service';

@Component({
  standalone: true,
  selector: 'em-payment-confirm-dialog',
  templateUrl: './payment-confirm-dialog.component.html',
  styleUrls: ['./payment-confirm-dialog.component.scss'],
  imports: [
    SimpleSelectListComponent,
    ReactiveFormsModule,
    SharedModule
],
  providers: [PaymentsService],
})
export class PaymentConfirmDialogComponent extends DestroyableComponent implements OnInit {
  form: FormGroup;
  paymentRefundReasons: ISelect[];
  loading: boolean = false;
  paymentRefundReasonId: string;


  constructor(
    public readonly dialogRef: MatDialogRef<PaymentConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogModel,
    private readonly fb: FormBuilder,
    private readonly service: PaymentsService,
    private readonly refundReasonService: PaymentRefundReasonService,
    private messageService: MessageService
  ) {
    super()
  }

  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  ngOnInit(): void {
    this.createForm();
    this.getPaymentRefundReasons()
  }

  confirm(): void {
    this.loading = true;
    this.service.paymentCancel(this.form.value)
      .pipe(
        finalize(() => this.loading = false),
        takeUntil(this.destroyed$)
      )
      .subscribe(res => {
        if (res.status) {
          this.dialogRef.close(res.message);
        } else {
          this.messageService.add({severity: ToastEnum.ERROR, summary: res.message});
          this.dialogRef.close();
          setValidationErrors(this.form, res);
        }
      })
  }

  cancel(): void {
    this.dialogRef.close(false);
  }

  onPaymentRefundReasonChange(selectedValue: string): void {
    this.paymentRefundReasonId = selectedValue;
    if (this.paymentRefundReasonId === '5aec0d1d-c58b-4008-9fa9-5a3e61eb0b56') {
      this.form.get('description')?.setValidators([Validators.required]);
    } else {
      this.form.get('description')?.clearValidators();
    }
    this.form.get('description')?.updateValueAndValidity();
  }

  private getPaymentRefundReasons(): void {
    this.refundReasonService.getPaymentRefundReasonsDictionary()
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => {
        if (res.status) {
          this.paymentRefundReasons = res.data;
        }
      })
  }

  private createForm(): void {
    this.form = this.fb.group({
      id: this.data.id,
      amount: this.data.amount,
      paymentRefundReasonId: ['', Validators.required],
      description: [''],
    })
  }
}
