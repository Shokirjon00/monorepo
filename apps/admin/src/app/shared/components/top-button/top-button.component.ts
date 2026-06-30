import { Component, input } from '@angular/core';
import { SvgIconComponent } from "angular-svg-icon";

@Component({
  standalone: true,
  selector: 'em-top-button',
  templateUrl: './top-button.component.html',
  imports: [
    SvgIconComponent
  ],
  styleUrls: ['./top-button.component.scss']
})
export class TopButtonComponent {
  readonly showScrollButton = input<boolean>(false);
  readonly topHeight = input<number>(0);
  readonly selector = input<string>('.main-body');

  scrollToTop(): void {
    const topPosition = document.querySelector(this.selector());
    topPosition.scrollTo({top: this.topHeight(), left: 0, behavior: 'smooth'});
  }
}
