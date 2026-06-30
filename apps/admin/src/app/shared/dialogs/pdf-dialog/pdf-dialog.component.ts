import { Component, inject, Inject } from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {AngularSvgIconModule} from 'angular-svg-icon';
import {PdfViewerModule} from 'ng2-pdf-viewer';

@Component({
  standalone: true,
  selector: 'em-pdf-dialog',
  templateUrl: './pdf-dialog.component.html',
  imports: [
    AngularSvgIconModule,
    PdfViewerModule
  ],
  styleUrls: ['./pdf-dialog.component.scss']
})
export class PdfDialogComponent {

  readonly data = inject<any>(MAT_DIALOG_DATA);
  private readonly matDialogRef = inject(MatDialogRef<PdfDialogComponent>);

  close(): void {
    this.matDialogRef.close();
  }

}
