import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormsModule } from "@angular/forms";
import { SvgIconComponent } from "angular-svg-icon";

export class ConfirmDialogModel {
  constructor(
    public title: string,
    public id: string,
    public amount?: string,
    public showInput: boolean = false,
    public cancelButtonText?: string,
    public successButtonText?: string,
    public options?: { id: string; name: string }[],
  ) {
  }
}

@Component({
  standalone: true,
  selector: 'em-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.scss'],
  imports: [
    FormsModule,
    SvgIconComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfirmDialogComponent {
  inputValue: string;
  showError: boolean;

  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogModel
  ) {
  }

  onConfirm(): void {
    if (this.data.showInput) {
      if (!this.inputValue) {
        this.showError = true;
        return;
      }
    }

    this.dialogRef.close(this.data.showInput ? this.inputValue : true);
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }

  onSelect(receiptTypeId: string): void {
    this.dialogRef.close(receiptTypeId);
  }

}
