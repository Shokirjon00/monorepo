import { Component, inject, Inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SvgIconComponent } from 'angular-svg-icon';

@Component({
  standalone: true,
  selector: 'em-image-dialog',
  templateUrl: './image-dialog.component.html',
  imports: [
    SvgIconComponent
  ],
  styleUrls: ['./image-dialog.component.scss']
})
export class ImageDialogComponent implements OnInit, OnDestroy {
  imageUrl = '';

  readonly dialogRef = inject(MatDialogRef<ImageDialogComponent>);
  readonly data = inject<File>(MAT_DIALOG_DATA);

  ngOnInit(): void {
    this.imageUrl = URL.createObjectURL(this.data);
  }

  ngOnDestroy(): void {
    URL.revokeObjectURL(this.imageUrl);
  }

  close(): void {
    this.dialogRef.close();
  }
}
