import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { PosService } from '@modules/client/pos/services/pos.service';
import { DestroyableComponent } from '@eskhata/util';
import { CommonModule } from '@angular/common';
import { QRCodeComponent } from 'angularx-qrcode';
import { PreloaderComponent } from '@shared/components/preloader/preloader.component';

@Component({
  standalone: true,
  selector: 'em-pos-qr-dialog',
  templateUrl: './pos-qr-dialog.component.html',
  styleUrls: ['./pos-qr-dialog.component.scss'],
  imports: [CommonModule, QRCodeComponent, PreloaderComponent],
  providers: [PosService]
})
export class PosQrDialogComponent extends DestroyableComponent {
  selectedQrSize: string = 'A4'
  qrBody: number = 465;
  connectionQr: string;
  loading: boolean = false;

  constructor(
    private dialogRef: MatDialogRef<PosQrDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public qrData: string,
  ) {
    super();
    this.connectionQr = qrData;
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
