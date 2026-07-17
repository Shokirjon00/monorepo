import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { SvgIconComponent } from "angular-svg-icon";

@Component({
  standalone: true,
  selector: 'em-image-dialog',
  templateUrl: './image-dialog.component.html',
  imports: [
    SvgIconComponent
  ],
  styleUrls: ['./image-dialog.component.scss']
})
export class ImageDialogComponent implements OnInit, OnDestroy{
  imageUrl = '';

  constructor(
    public dialogRef: MatDialogRef<ImageDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: File
  ) {}

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
