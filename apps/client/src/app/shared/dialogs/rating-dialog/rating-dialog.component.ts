import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { RatingComponent } from '@shared/components/rating/rating.component';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IRatingDialog } from '@shared/dialogs/rating-dialog/interfaces/rating-dialog.interface';

@Component({
  selector: 'em-rating-dialog',
  standalone: true,
  imports: [
    RatingComponent,
    ReactiveFormsModule,
  ],
  templateUrl: './rating-dialog.component.html',
  styleUrl: './rating-dialog.component.scss'
})
export class RatingDialogComponent {
  formGroup: FormGroup;
  selectedRating = 0;

  private readonly dialogRef = inject(MatDialogRef<RatingDialogComponent>);
  readonly data = inject<IRatingDialog>(MAT_DIALOG_DATA);

  constructor() {
    this.selectedRating = this.data.currentRating || 0;
    this.createFormGroup();
  }

  onRatingChange(rating: number): void {
    this.selectedRating = rating;
    this.formGroup.patchValue({ rating });
  }

  onSubmit(): void {
    if (this.selectedRating === 0) {
      return;
    }

    const result = {
      rating: this.selectedRating,
      ratingComment: this.data.allowComment ? this.formGroup.get('ratingComment')?.value?.trim() : undefined
    };

    this.dialogRef.close(result);
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }

  private createFormGroup(): void {
    this.formGroup = new FormGroup({
      rating: new FormControl(this.selectedRating, [Validators.required, Validators.min(1)]),
      ratingComment: new FormControl('')
    });
  }
}
