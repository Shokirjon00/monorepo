import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { IImportExcelResult } from '@modules/main-terminal/change-terminal-pos/interfaces/change-pos-terminal.interface';

@Component({
  standalone: true,
  selector: 'em-import-result-dialog',
  templateUrl: './import-result-dialog.component.html',
  styleUrls: ['./import-result-dialog.component.scss'],
  imports: [ MatDialogModule ]
})
export class ImportResultDialogComponent {
  readonly data = inject<IImportExcelResult>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<ImportResultDialogComponent>);

  close(): void {
    this.dialogRef.close();
  }
}
