import { Component, Input, output } from '@angular/core';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { NgClass } from '@angular/common';

@Component({
  standalone: true,
  selector: 'em-rating',
  templateUrl: './rating.component.html',
  styleUrls: ['./rating.component.scss'],
  imports: [
    AngularSvgIconModule,
    NgClass
  ]
})
export class RatingComponent {
  @Input() rating = 0;
  @Input() maxRating = 5;
  @Input() readonly = true;
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  readonly ratingChange = output<number>();

  get stars(): boolean[] {
    const stars = [];
    for (let i = 1; i <= this.maxRating; i++) {
      stars.push(i <= this.rating);
    }
    return stars;
  }

  onStarClick(index: number): void {
    if (!this.readonly) {
      const newRating = index + 1;
      this.rating = newRating;
      this.ratingChange.emit(newRating);
    }
  }
}
