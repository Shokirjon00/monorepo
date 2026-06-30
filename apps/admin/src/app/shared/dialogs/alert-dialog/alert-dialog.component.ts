import { ChangeDetectionStrategy, Component, inject, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

interface DataInterface {
  title: string;
  btnText: string;
}

@Component({
  standalone: true,
  selector: 'em-alert-dialog',
  templateUrl: './alert-dialog.component.html',
  styleUrls: ['./alert-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AlertDialogComponent {

  readonly data = inject<DataInterface>(MAT_DIALOG_DATA);
  readonly dialogRef = inject(MatDialogRef<AlertDialogComponent>);

  onClose(evt: MouseEvent): void {
    evt.preventDefault();
    evt.stopPropagation();
    this.dialogRef.close(true);
  }
}
