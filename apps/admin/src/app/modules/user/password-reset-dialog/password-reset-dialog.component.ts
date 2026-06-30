import { Component, Inject, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { ConfirmDialogModel } from "@shared/dialogs/confirm-dialog/confirm-dialog.component";

interface IMAT_DIALOG_DATA {
  title: string;
}

@Component({
  standalone: true,
  selector: 'em-password-reset-dialog',
  templateUrl: './password-reset-dialog.component.html',
  styleUrl: './password-reset-dialog.component.scss'
})
export class PasswordResetDialogComponent {

  readonly data = inject<IMAT_DIALOG_DATA>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject<MatDialogRef<PasswordResetDialogComponent>>(MatDialogRef);

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

}
