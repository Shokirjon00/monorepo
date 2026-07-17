import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  NgApexchartsModule,
} from 'ng-apexcharts';
import { IQrPosMetricCard, ISparklineOptions } from '../../interfaces/qr-pos-analytics.interface';
import { EmNumberPipe } from '@modules/analytics/pipes/em-number.pipe';

@Component({
  standalone: true,
  selector: 'em-qr-pos-cards',
  templateUrl: './qr-pos-cards.component.html',
  styleUrls: ['./qr-pos-cards.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, NgApexchartsModule, EmNumberPipe],
})
export class QrPosCardsComponent {
  readonly cards = input<IQrPosMetricCard[]>([]);
  readonly loading = input<boolean>(false);
  readonly cardClick = output<IQrPosMetricCard>();

  isDeltaGood(card: IQrPosMetricCard): boolean {
    const growing = (card.deltaPercent ?? 0) >= 0;
    return card.growthIsPositive === false ? !growing : growing;
  }

  gaugeBackground(card: IQrPosMetricCard): string {
    const gauge = card.gauge;
    if (!gauge) return '';
    const color = gauge.color ?? '#4E49CE';
    return `conic-gradient(${color} calc(${gauge.percent} * 1%), #ededfa 0)`;
  }

  sparkline(card: IQrPosMetricCard): ISparklineOptions {
    return {
      series: [{ name: card.title, data: card.trend ?? [] }],
      chart: { type: 'area', height: 48, sparkline: { enabled: true }, animations: { enabled: false } },
      stroke: { curve: 'smooth', width: 2 },
      fill: { type: 'gradient', gradient: { opacityFrom: 0.4, opacityTo: 0 } },
      colors: [card.color ?? '#4E49CE'],
      tooltip: { enabled: false },
    };
  }
}
