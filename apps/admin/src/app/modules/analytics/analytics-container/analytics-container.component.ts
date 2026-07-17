import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ANALYTICS_TABS } from '../analytics.constants';

@Component({
  standalone: true,
  selector: 'em-analytics-container',
  templateUrl: './analytics-container.component.html',
  styleUrls: ['./analytics-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet],
})
export class AnalyticsContainerComponent {
  readonly tabs = ANALYTICS_TABS;
}
