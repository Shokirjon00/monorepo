import { Component, DestroyRef, inject, Input, OnInit } from '@angular/core';
import { SvgIconComponent } from 'angular-svg-icon';
import { DatePipe } from '@angular/common';
import { HelperService } from '@eskhata/data-access';
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { MatDialog } from '@angular/material/dialog';
import { take } from 'rxjs';
import { HttpResponse } from '@angular/common/http';
import { ImageDialogComponent } from '../image-dialog/image-dialog.component';
import { IMessageCard } from './interfaces/message-card.interface';

@Component({
  selector: 'em-message-card',
  standalone: true,
  imports: [
    SvgIconComponent,
    DatePipe
  ],
  templateUrl: './message-card.component.html',
  styleUrl: './message-card.component.scss'
})
export class MessageCardComponent implements OnInit {
  @Input() messageData: IMessageCard;
  @Input() fileStorageUrl: string;
  @Input() fileStorageToken: string;
  @Input() fileIds: string[] = [];

  fileNameMap: { [fileId: string]: string } = {};
  fileName = '';

  private helperService = inject(HelperService);
  private matDialog = inject(MatDialog);
  private readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.fileIds.forEach(fileId => this.getRealFileName(fileId));
  }

  getRealFileName(fileId: string): void {
    if (this.fileNameMap[fileId]) return;

    this.helperService.getFile(this.fileStorageUrl, fileId, this.fileStorageToken)
      .pipe(take(1))
      .subscribe((res: HttpResponse<Blob>) => {
        const disposition = res.headers.get('Content-Disposition');
        const fileName = this.extractFileName(disposition) || `Файл_${fileId}.dat`;
        this.fileNameMap[fileId] = fileName;
      });
  }

  extractFileName(disposition: string | null): string | null {
    if (!disposition) return null;
    const header = disposition.trim();

    const star = /filename\*\s*=\s*[^']*''([^;]+)/i.exec(header);
    if (star?.[1]) return this.safeDecode(star[1]);

    const simple = /filename\s*=\s*"?([^";]+)"?/i.exec(header);
    if (simple?.[1]) return this.safeDecode(simple[1]);

    return null;
  }

  private safeDecode(value: string): string {
    try {
      return decodeURIComponent(value.trim());
    } catch {
      return value.trim();
    }
  }


  onFileClick(fileId: string, index: number): void {
    if (!this.fileStorageUrl || !this.fileStorageToken) return;

    this.helperService.getFile(this.fileStorageUrl, fileId, this.fileStorageToken)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(async (res: any) => {
        const blob = res.body;
        const file = new File([blob], 'image-preview', { type: blob.type });

        this.matDialog.open(ImageDialogComponent, {
          data: file,
          panelClass: 'custom-modalbox'
        });
      });
  }
}

