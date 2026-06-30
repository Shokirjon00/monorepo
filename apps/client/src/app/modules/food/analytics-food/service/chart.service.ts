import { Injectable } from '@angular/core';
import { DateRange } from '@core/enums/date-format.enum';
import { ApexOptions } from "ng-apexcharts";

@Injectable({providedIn: 'root'})
export class ChartService {
  prepareTimeData(dates: string[], values: number[]): [number, number][] {
    const seen = new Set<number>();
    const result: [number, number][] = [];

    dates.forEach((dateStr, index) => {
      const time = new Date(dateStr).getTime();
      if (!seen.has(time)) {
        result.push([time, values[index]]);
        seen.add(time);
      }
    });

    return result;
  }

  formatXAxisLabel(value: number, range: DateRange): string {
    const date = new Date(value);

    if (range === DateRange.TODAY) {
      return `${date.getHours().toString().padStart(2, '0')}:00`;
    }

    if (range === DateRange.WEEKLY) {
      const days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
      return days[date.getDay() === 0 ? 6 : date.getDay() - 1];
    }

    const day = date.getDate().toString().padStart(2, '0');
    const months = [
      'янв', 'фев', 'мар', 'апр', 'май', 'июн',
      'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'
    ];
    return `${day} ${months[date.getMonth()]}`;
  }

  createTimeSeriesChart(
    data: { dataTimes: string[]; data: number[] },
    range: DateRange,
    color: string
  ): ApexOptions {
    const categories = data.dataTimes.map(d =>
      this.formatXAxisLabel(new Date(d).getTime(), range)
    );

    return {
      series: [
        {
          name: '',
          data: data.data,
        },
      ],
      chart: {
        type: 'area',
        height: 220,
        zoom: {enabled: false},
        toolbar: {show: false},
      },
      colors: [color],
      stroke: {curve: 'smooth', width: 3},
      fill: {
        type: 'gradient',
        gradient: {opacityFrom: 0.4, opacityTo: 0.05},
      },
      xaxis: {
        categories,
      },
      tooltip: {
        y: {
          formatter: (val: number) => `${val.toLocaleString()} СМН`,
        },
      },
    };
  }

  createDonutChart(series: number[], labels: string[], colors: string[]) {
    return {
      series,
      labels,
      colors,
      chart: {type: 'donut', height: 250, toolbar: {show: false}},
      plotOptions: {pie: {donut: {size: '65%'}}},
      legend: {position: 'bottom'},
    };
  }
}
