import { Component, inject } from '@angular/core';
import { MatDialogRef } from "@angular/material/dialog";

@Component({
  standalone: true,
  selector: 'em-password-reset-dialog',
  templateUrl: './password-reset-dialog.component.html',
  styleUrl: './password-reset-dialog.component.scss'
})
export class PasswordResetDialogComponent {

  private readonly dialogRef = inject<MatDialogRef<PasswordResetDialogComponent>>(MatDialogRef);

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

}
