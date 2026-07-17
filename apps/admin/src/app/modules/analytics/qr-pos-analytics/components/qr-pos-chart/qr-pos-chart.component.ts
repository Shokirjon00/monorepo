import { ChangeDetectionStrategy, Component, computed, HostBinding, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgApexchartsModule } from 'ng-apexcharts';
import { ChartOptions } from '@modules/analytics/interfaces/chart-options.interface';
import { IQrPosChartData } from '../../interfaces/qr-pos-analytics.interface';

@Component({
  standalone: true,
  selector: 'em-qr-pos-chart',
  templateUrl: './qr-pos-chart.component.html',
  styleUrls: ['./qr-pos-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, NgApexchartsModule],
})
export class QrPosChartComponent {
  readonly data = input.required<IQrPosChartData>();
  readonly height = input<number>(280);
  readonly chartId = input<string>('');

  private readonly HEX_REGEX = /^#?([A-F\d]{2})([A-F\d]{2})([A-F\d]{2})$/;

  @HostBinding('style.--qp-chart-h') get hostHeight(): string {
    return `${this.height()}px`;
  }

  readonly options = computed<Partial<ChartOptions>>(() => this.buildOptions(this.data()));

  private buildOptions(data: IQrPosChartData): Partial<ChartOptions> {
    const hasDashed = data.series.some(s => s.dashed);
    const colors = data.colors ?? data.series.map(s => s.color ?? '#4E49CE');

    return {
      series: data.series.map(s => ({ name: s.name, data: s.data, color: s.color })),
      chart: {
        id: this.chartId() || undefined,
        type: data.type,
        height: '100%',
        width: '100%',
        toolbar: { show: false },
        zoom: { enabled: false },
        fontFamily: 'inherit',
        animations: {
          enabled: true,
          speed: 800,
          animateGradually: { enabled: true, delay: 120 },
          dynamicAnimation: { enabled: true, speed: 450 },
        },
        dropShadow: {
          enabled: data.type !== 'bar',
          top: 6,
          left: 0,
          blur: 8,
          color: colors[0],
          opacity: 0.18,
        },
      },
      colors,
      plotOptions: {
        bar: {
          horizontal: !!data.horizontal,
          columnWidth: '45%',
          barHeight: '58%',
          borderRadius: 8,
          borderRadiusApplication: 'end',
          distributed: !!data.colors,
          dataLabels: { position: data.horizontal ? 'center' : 'top' },
        },
      },
      stroke: {
        curve: 'smooth',
        lineCap: 'round',
        width: data.type === 'line' ? 3 : 0,
        dashArray: hasDashed ? data.series.map(s => (s.dashed ? 6 : 0)) : 0,
      },
      fill: this.buildFill(data, colors),
      markers: {
        size: data.type === 'line' ? 4 : 0,
        strokeWidth: 0,
        hover: { size: 6 },
      },
      dataLabels: {
        enabled: !!data.dataLabels,
        formatter: (val: unknown): string => this.compact(Number(val)),
        offsetX: data.horizontal ? 8 : 0,
        style: { fontSize: '12px', fontWeight: 700, colors: ['#3A3F51'] },
        background: { enabled: false },
      },
      legend: { show: data.series.length > 1 && !data.horizontal, position: 'top', horizontalAlign: 'right' },
      grid: { show: true, borderColor: '#EDEDFA', strokeDashArray: 4, padding: { left: 8, right: 8 } },
      xaxis: {
        categories: data.categories,
        labels: { rotate: 0, style: { colors: '#8E9AAF', fontSize: '12px' } },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: { labels: { style: { colors: '#8E9AAF', fontSize: '12px' } } },
      tooltip: { enabled: true, theme: 'light' },
    };
  }

  private buildFill(data: IQrPosChartData, colors: string[]): Partial<ChartOptions>['fill'] {
    if (data.gradient) {
      return {
        type: 'gradient',
        gradient: {
          shade: 'light',
          type: data.horizontal ? 'horizontal' : 'vertical',
          shadeIntensity: 0.35,
          gradientToColors: colors.map(c => this.lighten(c, 0.25)),
          opacityFrom: 1,
          opacityTo: 0.9,
          stops: [0, 100],
        },
      };
    }
    if (data.type === 'area') {
      return { type: 'gradient', gradient: { shadeIntensity: 0.3, opacityFrom: 0.45, opacityTo: 0.05, stops: [0, 100] } };
    }
    return { type: 'solid' };
  }

  private compact(value: number): string {
    if (Math.abs(value) >= 1_000_000) return `${(value / 1_000_000).toFixed(1)} млн`;
    if (Math.abs(value) >= 1_000) return `${(value / 1_000).toFixed(0)} тыс`;
    return value.toLocaleString('ru-RU');
  }
  private lighten(hex: string, amount: number): string {
    const m = this.HEX_REGEX.exec(hex.toUpperCase());

    if (!m) return hex;

    const mix = (c: number): number =>
      Math.round(c + (255 - c) * amount);

    const r = mix(parseInt(m[1], 16));
    const g = mix(parseInt(m[2], 16));
    const b = mix(parseInt(m[3], 16));

    return `#${[r, g, b]
      .map(x => x.toString(16).padStart(2, '0'))
      .join('')}`;
  }
}
