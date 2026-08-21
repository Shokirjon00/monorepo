import { Component, inject } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { EskhataBankLoaderComponent } from '@eskhata/ui';
import { SvgIconComponent } from 'angular-svg-icon';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';

@Component({
  selector: 'em-pdf-dialog',
  templateUrl: './pdf-dialog.component.html',
  imports: [
    EskhataBankLoaderComponent,
    SvgIconComponent,
    NgxExtendedPdfViewerModule
  ],
  styleUrls: ['./pdf-dialog.component.scss'],
  standalone: true
})
export class PdfDialogComponent {
  data: string | null = null;

  private matDialogRef = inject(MatDialogRef<PdfDialogComponent>);

  close(): void {
    this.matDialogRef.close();
  }
}
