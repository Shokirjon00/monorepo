import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
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

  constructor(@Inject(MAT_DIALOG_DATA) public data: DataInterface,
              public dialogRef: MatDialogRef<AlertDialogComponent>) {
  }

  onClose(evt: MouseEvent): void {
    evt.preventDefault();
    evt.stopPropagation();
    this.dialogRef.close(true);
  }
}
