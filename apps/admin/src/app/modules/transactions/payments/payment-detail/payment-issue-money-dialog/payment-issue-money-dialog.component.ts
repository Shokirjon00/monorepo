import { Component, inject, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { SvgIconComponent } from "angular-svg-icon";
import { IPaymentPaymentIssueMoney } from "@modules/transactions/payments/interfaces";

@Component({
  standalone: true,
  selector: 'em-payment-issue-money-dialog',
  templateUrl: './payment-issue-money-dialog.component.html',
  styleUrls: ['./payment-issue-money-dialog.component.scss'],
  imports: [
    SvgIconComponent
  ]
})
export class PaymentIssueMoneyDialogComponent {
  readonly data = inject<IPaymentPaymentIssueMoney>(MAT_DIALOG_DATA);
  readonly dialogRef = inject(MatDialogRef<PaymentIssueMoneyDialogComponent>);

  onClose(evt: MouseEvent): void {
    evt.preventDefault();
    evt.stopPropagation();
    this.dialogRef.close(true);
  }
}
