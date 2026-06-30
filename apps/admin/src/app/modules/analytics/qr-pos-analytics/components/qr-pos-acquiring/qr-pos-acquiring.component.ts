import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgApexchartsModule } from 'ng-apexcharts';
import { ChartOptions } from '@modules/analytics/interfaces/chart-options.interface';
import { IQrPosAcquiringStructure } from '../../interfaces/qr-pos-analytics.interface';
import { EmNumberPipe } from '@modules/analytics/pipes/em-number.pipe';

@Component({
  standalone: true,
  selector: 'em-qr-pos-acquiring',
  templateUrl: './qr-pos-acquiring.component.html',
  styleUrls: ['./qr-pos-acquiring.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, NgApexchartsModule, EmNumberPipe],
})
export class QrPosAcquiringComponent {

  readonly structure = input<IQrPosAcquiringStructure | null>(null);
  readonly hasData = computed<boolean>(() => (this.structure()?.items?.length ?? 0) > 0);
  readonly options = computed<Partial<ChartOptions>>(() => {
    const s = this.structure();
    const all = s?.items ?? [];
    const items = all.filter(i => i.value > 0);
    return {
      series: items.map(i => i.value),
      labels: items.map(i => i.label),
      colors: items.map(i => i.color ?? '#4E49CE'),
      chart: {
        type: 'donut',
        height: '100%',
        fontFamily: 'inherit',
        animations: {
          enabled: true,
          speed: 900,
          animateGradually: { enabled: true, delay: 200 },
          dynamicAnimation: { enabled: true, speed: 450 },
        },
        dropShadow: { enabled: true, top: 4, left: 0, blur: 12, opacity: 0.18 },
      },
      fill: {
        type: 'gradient',
        gradient: { shade: 'light', shadeIntensity: 0.45, opacityFrom: 1, opacityTo: 1, stops: [0, 100] },
      },
      legend: { show: false },
      dataLabels: { enabled: false },
      stroke: { width: 4, colors: ['#ffffff'], lineCap: 'round' },
      plotOptions: {
        pie: {
          expandOnClick: true,
          donut: {
            size: '76%',
            labels: {
              show: true,
              name: { fontSize: '13px', color: '#8E9AAF', offsetY: -4 },
              value: {
                fontSize: '26px', fontWeight: '800', color: '#1B2430', offsetY: 6,
                formatter: (val: string): string => Number(val).toLocaleString('ru-RU'),
              },
              total: {
                show: true,
                showAlways: true,
                label: s?.currency ?? 'Всего',
                fontSize: '13px',
                color: '#8E9AAF',
                formatter: (): string => (s?.total ?? 0).toLocaleString('ru-RU'),
              },
            },
          },
        },
      },
      tooltip: {
        enabled: true,
        fillSeriesColor: false,
        theme: 'light',
        y: { formatter: (val: number): string => `${val.toLocaleString('ru-RU')} ${s?.currency ?? ''}` },
      },
    };
  });
}
