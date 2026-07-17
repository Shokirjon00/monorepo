import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'em-error-order-status-dialog',
  templateUrl: './error-order-status-dialog.component.html',
  standalone: true,
  styleUrls: ['./error-order-status-dialog.component.scss']
})
export class ErrorOrderStatusDialogComponent {
  orderIds: string[];

  constructor(
    private dialogRef: MatDialogRef<ErrorOrderStatusDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: string[]
  ) {
    this.orderIds = data;
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
