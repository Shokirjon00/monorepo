import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ApexOptions, ChartComponent } from 'ng-apexcharts';
import { NgTemplateOutlet } from '@angular/common';
import { EmHeaderComponent } from '@shared/components/em-header/em-header.component';
import { MultiDropdownComponent } from '@shared/components/multi-dropdown/multi-dropdown.component';
import { environment as env } from '@environments/environment';
import { RatingDashboardService } from '@modules/food/rating-dashboard/services/rating-dashboard.service';
import { IRatingDashboard } from '@modules/food/rating-dashboard/interfaces/rating-dashboard';
import { ActivatedRoute, Params, Router } from '@angular/router';

@Component({
  selector: 'em-rating-dashboard',
  imports: [ChartComponent, ChartComponent, EmHeaderComponent, NgTemplateOutlet, MultiDropdownComponent],
  templateUrl: './rating-dashboard.component.html',
  styleUrl: './rating-dashboard.component.scss',
  providers: [RatingDashboardService],
})
export class RatingDashboardComponent implements OnInit {
  merchantApi = `${env.apiFoodUrl}/${env.api.dictionaries}/${env.api.restaurantPoints}`;
  selectedMerchant: { name: string; icon: string }[] = [{ name: 'Торговые точки', icon: 'checkmark-double.svg' }];
  selectedMerchantIds: string[] = [];
  readonly allMerchantIds = signal<string[]>([]);
  dashboardData = signal<IRatingDashboard | null>(null);
  chartOptions = computed<ApexOptions | null>(() => {
    const data = this.dashboardData()?.overallRatings;
    if (!data) return null;

    return {
      series: data.chartData.series,
      chart: { type: 'line', height: 260, toolbar: { show: false } },
      xaxis: { categories: data.chartData.dates },
      stroke: { curve: 'smooth', width: 2 },
      markers: { size: 4 },
      tooltip: { enabled: true },
    };
  });
  ratings = computed(() => {
    const reviews = this.dashboardData()?.orderReviews?.chartData; // Обязательно ?.
    if (!reviews) return [];

    return reviews.map(item => ({
      label: item.rating,
      count: item.quantity,
      value: item.percentage,
      color: this.getColor(item.rating),
    }));
  });
  readonly overallRatingVm = computed(() => {
    const overall = this.dashboardData()?.overallRatings;

    if (!overall) return null;

    return {
      value: overall.overallRating,
      delta: overall.delta,
      deltaText: `${overall.delta > 0 ? '+' : ''}${overall.delta}`,
      deltaClass:
        overall.delta > 0
          ? 'dashboard-rating-diff--positive'
          : overall.delta < 0
            ? 'dashboard-rating-diff--negative'
            : '',
      trendIcon: overall.delta >= 0 ? './assets/icons/trending-up.svg' : './assets/icons/trending-down.svg',
    };
  });
  private readonly ratingService = inject(RatingDashboardService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  get cancellationPointerPos() {
    const perc = this.dashboardData()?.cancellationRating.canceledOrdersPercentage || 0;
    return Math.min((perc / 50) * 100, 100);
  }

  get reactionPointerPos() {
    const rating = this.dashboardData()?.reactionTimeRating.rating || 1;
    return ((rating - 1) / 4) * 100;
  }

  merchantChange(merchantIds: string[]): void {
    this.selectedMerchantIds = merchantIds.length ? merchantIds : [];
    this.updateQueryParams({ merchantId: this.selectedMerchantIds });
    this.resetAndFetch();
  }

  onAllMerchantsLoaded(ids: string[]): void {
    this.allMerchantIds.set(ids);
    const merchantIdsFromUrl = this.route.snapshot.queryParams['merchantId'];
    const initialIds = merchantIdsFromUrl?.length
      ? Array.isArray(merchantIdsFromUrl)
        ? merchantIdsFromUrl
        : [merchantIdsFromUrl]
      : [];
    this.selectedMerchantIds = [...initialIds];
  }

  clearMerchant(): void {
    this.selectedMerchant = [{ name: 'Торговые точки', icon: 'checkmark-double.svg' }];
    this.selectedMerchantIds = [];

    this.updateQueryParams({ merchantId: null });

    this.resetAndFetch();
  }

  ngOnInit(): void {
    this.restoreFiltersFromUrl();
    this.loadData();
  }

  loadData() {
    const params: any = {};
    if (this.selectedMerchantIds && this.selectedMerchantIds.length > 0) {
      params.RestaurantPointIds = this.selectedMerchantIds;
    }
    this.ratingService.getRatingDashboard(params).subscribe({
      next: res => {
        if (res && res.data) {
          this.dashboardData.set(res.data);
        }
      },
      error: err => console.error('Ошибка загрузки дашборда', err),
    });
  }

  private getColor(rating: number): string {
    if (rating === 5) return 'green';
    if (rating === 4) return 'yellow';
    return 'red';
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

  private resetAndFetch(): void {
    this.loadData();
  }

  private restoreFiltersFromUrl(): void {
    const params = this.route.snapshot.queryParams;
    const merchantIdsFromUrl = params['merchantId'];

    if (merchantIdsFromUrl) {
      const ids = Array.isArray(merchantIdsFromUrl) ? merchantIdsFromUrl : [merchantIdsFromUrl];
      this.selectedMerchantIds = ids;

      this.selectedMerchant = [];
    } else {
      this.selectedMerchantIds = [];
      this.selectedMerchant = [{ name: 'Торговые точки', icon: 'checkmark-double.svg' }];
    }
  }
}
