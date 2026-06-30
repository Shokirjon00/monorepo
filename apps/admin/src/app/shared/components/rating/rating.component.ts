import { Component, Input } from '@angular/core';
import { SvgIconComponent } from "angular-svg-icon";

@Component({
  selector: 'em-rating',
  standalone: true,
  imports: [
    SvgIconComponent
  ],
  templateUrl: './rating.component.html',
  styleUrl: './rating.component.scss'
})
export class RatingComponent {
  @Input() rating = 0;
  @Input() maxRating = 5;
  @Input() readonly = true;
  @Input() size: 'small' | 'medium' | 'large' = 'medium';

  get stars(): boolean[] {
    const stars = [];
    for (let i = 1; i <= this.maxRating; i++) {
      stars.push(i <= this.rating);
    }
    return stars;
  }
}
