import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { ChartWidgetComponent } from '@shared/components/chart-widget/chart-widget.component';
import { MultiDropdownComponent } from '@eskhata/ui';
import { StatisticsService } from '@modules/food/analytics-food/service/statistics.service';
import { environment as env } from '@environments/environment';
import { DateRange } from '@eskhata/util';
import { IFilterParams } from '@core/interfaces';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DateRangeFilterComponent } from '@shared/components/date-range-filter/date-range-filter.component';
import { NgxPermissionsModule } from 'ngx-permissions';
import { IClientsData } from '@modules/food/analytics-food/interface/analytics.interface';
import { ChartService } from '@modules/food/analytics-food/service/chart.service';
import {
  defaultClientsData,
  defaultRevenuesData,
  defaultRevenueStatsData,
} from '@modules/food/analytics-food/analytics';
import { Router, ActivatedRoute } from '@angular/router';
import { FilterType } from '@core/enums/filter';

@Component({
  selector: 'em-analytics-food',
  templateUrl: './analytics-food.component.html',
  styleUrls: ['./analytics-food.component.scss'],
  imports: [ChartWidgetComponent, MultiDropdownComponent, DateRangeFilterComponent, NgxPermissionsModule],
})
export class AnalyticsFoodComponent implements OnInit {
  merchantApi = `${env.apiFoodUrl}/${env.api.dictionaries}/${env.api.restaurantPoints}`;
  selectedMerchant: { name: string; icon: string }[] = [];
  queryParams: IFilterParams | any = { page: 1 };
  selectedMerchantIds: string[] = [];
  dateRangeStats: DateRange = DateRange.TODAY;
  dateRangeRevenue: DateRange = DateRange.WEEKLY;
  dateRangeClients: DateRange = DateRange.TODAY;

  private statsLoadedOnce = false;
  readonly DateRange = DateRange;
  readonly FilterType = FilterType;

  private service = inject(StatisticsService);
  private chartService = inject(ChartService);
  private readonly destroyRef = inject(DestroyRef);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  allMerchantIds = signal<string[]>([]);

  clientsData = signal(defaultClientsData);
  revenueStatsData = signal(defaultRevenueStatsData);
  revenuesData = signal(defaultRevenuesData);

  hasRevenueData = computed(() => this.revenueStatsData().revenue.data.length > 0);
  hasAverageBillData = computed(() => this.revenueStatsData().averageBill.data.length > 0);
  hasOrdersData = computed(() => this.revenueStatsData().orders.series.some(s => s > 0));
  totalRevenuesValue = computed(() => this.revenuesData().totalRevenues ?? 0);
  hasImprovementData = computed(() => {
    const data = this.revenuesData();
    return data.series.length > 0 && data.series.some(s => s.data && s.data.some(point => point > 0));
  });

  revenueChart = computed(() =>
    this.chartService.createTimeSeriesChart(this.revenueStatsData().revenue, this.dateRangeStats, '#f39c12')
  );

  avgCheckChart = computed(() =>
    this.chartService.createTimeSeriesChart(this.revenueStatsData().averageBill, this.dateRangeStats, '#9b59b6')
  );

  improvementChart = computed(() => {
    const revenues = this.revenuesData();
    const range = this.dateRangeRevenue;

    const categories = revenues.dateTimes.map(d => this.chartService.formatXAxisLabel(new Date(d).getTime(), range));

    return {
      series: [
        {
          name: 'Фактическая выручка',
          data: revenues.series[0].data,
        },
        {
          name: 'Упущенная выручка',
          data: revenues.series[1].data,
        },
      ],
      chart: { type: 'area', height: 300, zoom: { enabled: false }, toolbar: { show: false } },
      colors: ['#1E90FF', '#ff0000'],
      stroke: { curve: 'smooth', width: 4 },
      markers: { size: 6, strokeWidth: 2, hover: { size: 8 } },
      legend: {
        position: 'bottom',
        horizontalAlign: 'center',
        formatter: (seriesName: any) => {
          if (seriesName === 'Фактическая выручка') {
            return `${seriesName} — ${revenues.actualRevenuePercentage.toFixed(2)}%`;
          }
          if (seriesName === 'Упущенная выручка') {
            return `${seriesName} — ${revenues.lostRevenuePercentage.toFixed(2)}%`;
          }
          return seriesName;
        },
        onItemClick: { toggleDataSeries: false },
        onItemHover: { highlightDataSeries: false },
      },
      fill: { type: 'gradient', gradient: { opacityFrom: 0.4, opacityTo: 0.05 } },
      subtitle: {
        text: `Общая выручка: ${revenues.totalRevenues.toLocaleString()}`,
        align: 'center',
      },
      xaxis: {
        categories,
      },
    };
  });

  ordersChart = computed(() => {
    const data = this.revenueStatsData().orders;
    const orderedLabels = ['Завершен', 'Отменен'];
    const orderedSeries = orderedLabels.map(label => {
      const index = data.labels.indexOf(label);
      return index >= 0 ? data.series[index] : 0;
    });
    return this.chartService.createDonutChart(orderedSeries, orderedLabels, ['#2ecc71', '#ff0000']);
  });

  frequencyChart = computed(() => {
    const data = this.clientsData().ordersFrequency;
    return {
      series: data.series,
      labels: data.labels,
      colors: ['#e67e22', '#2ecc71'],
      chart: { type: 'donut', height: 250, toolbar: { show: false } },
      plotOptions: {
        pie: {
          donut: {
            size: '65%',
            labels: {
              show: true,
              total: {
                show: true,
                label: 'Частота',
                fontSize: '12px',
                color: '#000',
                formatter: () => data.average.toFixed(2),
              },
            },
          },
        },
      },
      legend: { position: 'bottom' },
    };
  });

  ngOnInit(): void {
    this.restoreFilters();
    this.setDefault();
  }

  setDateRange(range: DateRange, type: FilterType): void {
    switch (type) {
      case FilterType.STATS:
        this.dateRangeStats = range;
        break;
      case FilterType.REVENUE:
        this.dateRangeRevenue = range;
        break;
      case FilterType.CLIENTS:
        this.dateRangeClients = range;
        break;
    }

    this.loadDataByType(type);
    this.updateQueryParams({ [`${type}Range`]: range });
  }

  onAllMerchantsLoaded(ids: string[]): void {
    this.allMerchantIds.set(ids);
    if (!this.statsLoadedOnce) {
      const merchantIds = this.queryParams.merchantId?.length ? this.queryParams.merchantId : ids;
      this.selectedMerchantIds = merchantIds.length ? merchantIds : [...ids];
      this.loadStats(merchantIds);
      this.loadRevenues(merchantIds);
      this.loadClients(merchantIds);
      this.statsLoadedOnce = true;
    }
  }

  merchantChange(merchantIds: string[]): void {
    this.selectedMerchantIds = merchantIds.length ? merchantIds : [...this.allMerchantIds()];
    this.updateQueryParams({ merchantId: this.selectedMerchantIds });
    this.loadAllSelectedData();
  }

  clearMerchant(): void {
    this.selectedMerchant = [{ name: 'Торговые точки', icon: 'checkmark-double.svg' }];
    this.selectedMerchantIds = [];

    this.queryParams = { ...this.queryParams, merchantId: [] };

    this.updateQueryParams({ merchantId: null });
  }

  clientsStats(): IClientsData {
    const data = this.clientsData();
    return {
      total: data.allClients.quantity,
      new: data.newClients.quantity,
      frequency: { '1-3': data.ordersFrequency.series[0] ?? 0, '4+': data.ordersFrequency.series[1] ?? 0 },
      totalByDays: data.ordersFrequency.series,
      newByDays: data.ordersFrequency.series,
      ordersFrequency: data.ordersFrequency,
    };
  }

  totalOrders(): number {
    return this.revenueStatsData().orders.series.reduce((a, b) => a + b, 0);
  }

  private restoreFilters(): void {
    this.route.queryParams.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
      this.queryParams = params;

      if (params['statsRange']) {
        this.dateRangeStats = params['statsRange'];
      }
      if (params['revenueRange']) {
        this.dateRangeRevenue = params['revenueRange'];
      }
      if (params['clientsRange']) {
        this.dateRangeClients = params['clientsRange'];
      }
      if (params['merchantId'] && params['merchantId'].length) {
        this.selectedMerchantIds = Array.isArray(params['merchantId']) ? params['merchantId'] : [params['merchantId']];
      } else {
        this.selectedMerchantIds = [];
        this.selectedMerchant = [{ name: 'Торговые точки', icon: 'checkmark-double.svg' }];
      }
      this.loadAllSelectedData();
    });
  }

  private updateQueryParams(params: Record<string, unknown>): void {
    this.router
      .navigate([], {
        relativeTo: this.route,
        queryParams: params,
        queryParamsHandling: 'merge',
      })
      .catch();
  }

  private getSelectedMerchantIds(): string[] {
    return this.selectedMerchantIds.length ? this.selectedMerchantIds : this.allMerchantIds();
  }

  private loadDataByType(type: 'stats' | 'revenue' | 'clients'): void {
    const ids = this.getSelectedMerchantIds();
    if (type === 'stats') {
      this.loadStats(ids);
    }
    if (type === 'revenue') {
      this.loadRevenues(ids);
    }
    if (type === 'clients') {
      this.loadClients(ids);
    }
  }

  private loadAllSelectedData(): void {
    const ids = this.getSelectedMerchantIds();
    if (this.dateRangeStats) {
      this.loadStats(ids, this.dateRangeStats);
    }
    if (this.dateRangeRevenue) {
      this.loadRevenues(ids, this.dateRangeRevenue);
    }
    if (this.dateRangeClients) {
      this.loadClients(ids, this.dateRangeClients);
    }
  }

  private loadStats(merchantIds?: string[], range?: DateRange): void {
    const ids = merchantIds || this.getSelectedMerchantIds();
    const dateRangeToUse = range ?? this.dateRangeStats;
    this.service
      .getCommon(ids, dateRangeToUse)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(res => {
        if (res.status) {
          this.revenueStatsData.set(res.data);
        }
      });
  }

  private loadRevenues(merchantIds?: string[], range?: DateRange): void {
    const ids = merchantIds || this.getSelectedMerchantIds();
    const dateRangeToUse = range ?? this.dateRangeRevenue;
    this.service
      .getRevenues(ids, dateRangeToUse)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(res => {
        if (res.status) {
          this.revenuesData.set(res.data);
        }
      });
  }

  private loadClients(merchantIds?: string[], range?: DateRange): void {
    const ids = merchantIds || this.getSelectedMerchantIds();
    const dateRangeToUse = range ?? this.dateRangeClients;
    this.service
      .getClients(ids, dateRangeToUse)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(res => {
        if (res.status) {
          this.clientsData.set(res.data);
        }
      });
  }

  private setDefault(): void {
    this.queryParams = {};
    this.selectedMerchant = [{ name: 'Торговые точки', icon: 'checkmark-double.svg' }];
  }
}
