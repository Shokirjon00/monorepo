import { Component, inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ConfirmDialogModel } from '@shared/dialogs/confirm-dialog/confirm-dialog.component';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PaymentService } from '@modules/payment/services/payment.service';
import { takeUntil } from 'rxjs';
import { ISelect } from '@eskhata/util';
import { DestroyableComponent } from '@eskhata/util';
import { EskhataBankLoaderComponent, SimpleSelectListComponent, ValidatorModule } from '@eskhata/ui';
import { MessageService } from '@eskhata/data-access';
import { setValidationErrors } from '@core/validators/set-validation-errors';
import { finalize } from 'rxjs/operators';
import { ToastEnum } from '@eskhata/util';

@Component({
  standalone: true,
  selector: 'em-payment-confirm-dialog',
  templateUrl: './payment-confirm-dialog.component.html',
  styleUrls: ['./payment-confirm-dialog.component.scss'],
  imports: [
    ReactiveFormsModule,
    ValidatorModule,
    EskhataBankLoaderComponent,
    SimpleSelectListComponent
],
  providers: [
    PaymentService,
    MessageService
  ]
})
export class PaymentConfirmDialogComponent extends DestroyableComponent implements OnInit {
  form: FormGroup;
  paymentRefundReasons: ISelect[];
  loading: boolean = false;

  readonly dialogRef = inject(MatDialogRef<PaymentConfirmDialogComponent>);
  readonly data = inject<ConfirmDialogModel>(MAT_DIALOG_DATA);

  private readonly fb = inject(FormBuilder);
  private readonly service = inject(PaymentService);
  private readonly messageService = inject(MessageService);

  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  ngOnInit(): void {
    this.createForm();
    this.getPaymentRefundReasons();
    this.handleReasonChange();
  }

  onConfirm(): void {
    this.loading = true;
    this.service.paymentCansel(this.form.value)
      .pipe(
        finalize(() => this.loading = false),
        takeUntil(this.destroyed$)
      )
      .subscribe(res => {
        if (res.status) {
          this.dialogRef.close(res);
        } else {
          this.messageService.add({severity: ToastEnum.ERROR, summary: res.message});
          setValidationErrors(this.form, res);
        }
      });
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  private getPaymentRefundReasons(): void {
    this.service.getPaymentRefundReasons()
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

  private handleReasonChange(): void {
    this.form.get('paymentRefundReasonId')?.valueChanges
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => {
        if (res === 'Другое') {
          this.form.get('description')?.setValidators(Validators.required);
        } else {
          this.form.get('description')?.clearValidators();
        }
        this.form.get('description')?.updateValueAndValidity();
      });
  }
}
