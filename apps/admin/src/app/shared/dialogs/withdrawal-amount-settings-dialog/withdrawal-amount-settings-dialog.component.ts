import { Component, Inject } from '@angular/core';
import { ISelect } from '@eskhata/util';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { SimpleSelectListComponent } from '@eskhata/ui';

@Component({
  standalone: true,
  selector: 'em-withdrawal-amount-settings-dialog',
  templateUrl: './withdrawal-amount-settings-dialog.component.html',
  imports: [
    FormsModule,
    SimpleSelectListComponent
  ],
  styleUrls: ['./withdrawal-amount-settings-dialog.component.scss']
})
export class WithdrawalAmountSettingsDialogComponent {
  periodTypes: ISelect[];
  periodId: string;
  time: string;

  constructor(@Inject(MAT_DIALOG_DATA) public data: ISelect[],
              private dialogRef: MatDialogRef<WithdrawalAmountSettingsDialogComponent>) {
    this.periodTypes = data;
  }

  selectPeriod(value: ISelect): void {
    this.periodId = value.id;
  }

  confirmDialog(): void {
    if (this.periodTypes.length) {
      this.dialogRef.close(this.periodId);
    } else {
      this.dialogRef.close(this.time);
    }
  }

  closeDialog(): void {
    this.dialogRef.close(false);
  }

}
