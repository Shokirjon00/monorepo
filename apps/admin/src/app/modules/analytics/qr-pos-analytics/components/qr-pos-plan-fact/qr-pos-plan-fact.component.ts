import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IPlanFactRow, IQrPosPlanFactForecast } from '../../interfaces/qr-pos-analytics.interface';
import { EmNumberPipe } from '@modules/analytics/pipes/em-number.pipe';

@Component({
  standalone: true,
  selector: 'em-qr-pos-plan-fact',
  templateUrl: './qr-pos-plan-fact.component.html',
  styleUrls: ['./qr-pos-plan-fact.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, EmNumberPipe],
})
export class QrPosPlanFactComponent {
  readonly data = input<IQrPosPlanFactForecast | null>(null);

  readonly rows = computed<IPlanFactRow[]>(() => {
    const d = this.data();
    if (!d) return [];
    const max = Math.max(d.fact, d.plan, d.forecast, 1);
    const h = (v: number): number => Math.round((v / max) * 100);
    return [
      { key: 'fact', label: 'Факт', value: d.fact, heightPercent: h(d.fact) },
      { key: 'plan', label: 'План', value: d.plan, heightPercent: h(d.plan) },
      { key: 'forecast', label: 'Прогноз', value: d.forecast, heightPercent: h(d.forecast) },
    ];
  });

  readonly planCompletion = computed<number | null>(() => {
    const d = this.data();
    if (!d || !d.plan) return null;
    return Math.round((d.fact / d.plan) * 100);
  });

  readonly forecastVsPlan = computed<number | null>(() => {
    const d = this.data();
    if (!d || !d.plan) return null;
    return Math.round(((d.forecast - d.plan) / d.plan) * 100);
  });
}
