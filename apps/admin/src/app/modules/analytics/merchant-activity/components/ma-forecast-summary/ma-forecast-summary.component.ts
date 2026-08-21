import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { ITurnoverForecast } from '../../interfaces/merchant-activity.interface';
import { EmNumberPipe } from '@modules/analytics/pipes/em-number.pipe';

@Component({
  standalone: true,
  selector: 'em-ma-forecast-summary',
  templateUrl: './ma-forecast-summary.component.html',
  styleUrls: ['./ma-forecast-summary.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [EmNumberPipe],
})
export class MaForecastSummaryComponent {
  readonly forecast = input<ITurnoverForecast | null>(null);

  readonly completion = computed<number | null>(() => {
    const f = this.forecast();
    if (!f || !f.forecastTotal) return null;
    return Math.round((f.actualTotal / f.forecastTotal) * 100);
  });

  forecastWidth(f: ITurnoverForecast): number {
    return this.ratio(f.forecastTotal, f.actualTotal);
  }

  actualWidth(f: ITurnoverForecast): number {
    return this.ratio(f.actualTotal, f.forecastTotal);
  }

  private ratio(a: number, b: number): number {
    const max = Math.max(a, b, 1);
    return Math.round((a / max) * 100);
  }
}
