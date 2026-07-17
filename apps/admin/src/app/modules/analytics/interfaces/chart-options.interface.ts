import {
  ApexAxisChartSeries,
  ApexChart,
  ApexDataLabels,
  ApexFill,
  ApexGrid,
  ApexLegend,
  ApexMarkers,
  ApexNonAxisChartSeries,
  ApexPlotOptions,
  ApexResponsive,
  ApexStroke,
  ApexTooltip,
  ApexXAxis,
  ApexYAxis
} from 'ng-apexcharts';

export type ChartOptions = {
  series: number[] | ApexAxisChartSeries;
  chart: ApexChart;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  yaxis: ApexYAxis;
  xaxis: ApexXAxis;
  grid: ApexGrid;
  colors: string[];
  legend: ApexLegend;
  stroke: ApexStroke;
  tooltip: ApexTooltip;
  markers: ApexMarkers;
  labels: string[];
  fill?: ApexFill;
  responsive: any;
  all?: any;
  incoming?: any;
  outgoing?: any;
};

export type ChartOptionsSecond = {
  fill: ApexFill;
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  colors: string[];
  tooltip: ApexTooltip;
  responsive: ApexResponsive[];
  labels: any;
};
