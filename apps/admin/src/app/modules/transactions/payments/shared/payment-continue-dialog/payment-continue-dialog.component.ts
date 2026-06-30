import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AngularSvgIconModule } from 'angular-svg-icon';

import { IPaymentContinue } from '@modules/transactions/payments/interfaces';

@Component({
  standalone: true,
  selector: 'em-payment-continue-dialog',
  templateUrl: './payment-continue-dialog.component.html',
  styleUrls: ['./payment-continue-dialog.component.scss'],
  imports: [
    AngularSvgIconModule
]
})
export class PaymentContinueDialogComponent {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: IPaymentContinue,
    public dialogRef: MatDialogRef<PaymentContinueDialogComponent>
  ) { }

  onClose(evt: MouseEvent): void {
    evt.preventDefault();
    evt.stopPropagation();
    this.dialogRef.close(true);
  }
}
