import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  standalone: true,
  selector: 'em-small-preloader',
  templateUrl: './small-preloader.component.html',
  styleUrls: ['./small-preloader.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SmallPreloaderComponent {
  constructor() {}
}
