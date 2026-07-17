import { Component, inject } from '@angular/core';
import { ISelect } from '@core/interfaces/select.interface';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SimpleSelectListComponent } from '@shared/components/simple-select-list/simple-select-list.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'em-withdrawal-amount-settings-dialog',
  templateUrl: './withdrawal-amount-settings-dialog.component.html',
  imports: [SimpleSelectListComponent, FormsModule],
  styleUrls: ['./withdrawal-amount-settings-dialog.component.scss'],
})
export class WithdrawalAmountSettingsDialogComponent {
  periodTypes: ISelect[];
  periodId: string;
  time: string;

  readonly data = inject<ISelect[]>(MAT_DIALOG_DATA);
  private dialogRef = inject<MatDialogRef<WithdrawalAmountSettingsDialogComponent>>(MatDialogRef);

  constructor() {
    this.periodTypes = this.data;
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
    this.dialogRef.close();
  }
}
