import { Component, computed, DestroyRef, inject, OnInit, signal, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { first } from 'rxjs/operators';
import { ToastComponent } from '@shared/components/toast/toast.component';
import { QrPosFiltersComponent } from './components/qr-pos-filters/qr-pos-filters.component';
import { QrPosCardsComponent } from './components/qr-pos-cards/qr-pos-cards.component';
import { QrPosChartComponent } from './components/qr-pos-chart/qr-pos-chart.component';
import { QrPosAcquiringComponent } from './components/qr-pos-acquiring/qr-pos-acquiring.component';
import { QrPosGeographyComponent } from './components/qr-pos-geography/qr-pos-geography.component';
import { QrPosPanelComponent } from './components/qr-pos-panel/qr-pos-panel.component';
import { QrPosPlanFactComponent } from './components/qr-pos-plan-fact/qr-pos-plan-fact.component';
import { MerchantActivityComponent } from '@modules/analytics/merchant-activity/merchant-activity.component';
import { QrPosFilterService } from './services/qr-pos-filter.service';
import { QrPosAnalyticService } from './services/qr-pos-analytic.service';
import { DashboardLoaderService } from '@modules/analytics/services/dashboard-loader.service';
import {
  IQrPosAcquiringStructure,
  IQrPosChartData,
  IQrPosDynamics,
  IQrPosFilter,
  IQrPosGeography,
  IQrPosMetricCard,
  IQrPosPlanFactForecast,
} from './interfaces/qr-pos-analytics.interface';
import { AnalyticsTabsBarComponent } from '../analytics-container/analytics-tabs-bar/analytics-tabs-bar.component';
import { ANALYTICS_TABS } from '../analytics.constants';

@Component({
  standalone: true,
  selector: 'em-qr-pos-analytics',
  templateUrl: './qr-pos-analytics.component.html',
  styleUrls: ['./qr-pos-analytics.component.scss'],
  providers: [QrPosFilterService, QrPosAnalyticService, DashboardLoaderService],
  imports: [
    CommonModule,
    ToastComponent,
    QrPosFiltersComponent,
    QrPosCardsComponent,
    QrPosChartComponent,
    QrPosAcquiringComponent,
    QrPosGeographyComponent,
    QrPosPanelComponent,
    QrPosPlanFactComponent,
    MerchantActivityComponent,
    AnalyticsTabsBarComponent,
  ],
})
export class QrPosAnalyticsComponent implements OnInit {
  private readonly filterService = inject(QrPosFilterService);
  private readonly service = inject(QrPosAnalyticService);
  private readonly loader = inject(DashboardLoaderService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly tabs = ANALYTICS_TABS;

  private readonly merchantActivity = viewChild(MerchantActivityComponent);

  readonly filter = this.filterService.filter;
  readonly apiParams = this.filterService.params;
  readonly loading = this.loader.loading;
  readonly ready = signal(false);

  private readonly cardsData = signal<IQrPosMetricCard[]>([]);
  private readonly dynamicsData = signal<IQrPosDynamics | null>(null);
  private readonly planFactData = signal<IQrPosPlanFactForecast | null>(null);
  private readonly acquiringData = signal<IQrPosAcquiringStructure | null>(null);
  private readonly geographyData = signal<IQrPosGeography | null>(null);

  readonly cards = this.cardsData.asReadonly();
  readonly acquiring = this.acquiringData.asReadonly();
  readonly geography = this.geographyData.asReadonly();
  readonly planFact = this.planFactData.asReadonly();

  readonly dynamicsChart = computed<IQrPosChartData | null>(() => {
    const d = this.dynamicsData();
    if (!d) return null;
    return {
      type: 'line',
      categories: d.categories,
      series: [
        { name: 'Факт', data: d.fact, color: '#61BE40' },
        { name: 'Прошлый период', data: d.plan, color: '#2C7BE3', dashed: true },
      ],
    };
  });

  readonly planFactTitle = computed(() => {
    const p = this.planFact();
    const suffix = p?.year && p?.quarter ? `квартал ${p.quarter} - ${p.year}` : 'квартал';
    return `План / Факт / Прогноз — оборот (${suffix})`;
  });

  readonly noDynamics = computed(() => !this.dynamicsChart()?.series.some(s => s.data.some(v => v != null && v !== 0)));
  readonly noPlanFact = computed(() => {
    const p = this.planFact();
    return !p || (!p.fact && !p.plan && !p.forecast);
  });
  readonly noAcquiring = computed(() => !(this.acquiring()?.total) && !(this.acquiring()?.items?.some(i => i.value > 0)));
  readonly noGeography = computed(() => !(this.geography()?.regions?.length));

  ngOnInit(): void {
    this.route.queryParams.pipe(first(), takeUntilDestroyed(this.destroyRef))
      .subscribe(q => {
        this.filterService.applyFromRoute(q);
        this.reload();
      });
  }

  onFilterChange(part: Partial<IQrPosFilter>): void {
    this.filterService.patch(part);
    this.syncRoute();
    this.reload();
  }

  onResetFilters(): void {
    this.filterService.reset();
    this.syncRoute();
    this.reload();
  }

  onSettingsChange(): void {
    this.reload();
    this.merchantActivity()?.refresh();
  }

  onCardClick(card: IQrPosMetricCard): void {
    void card;
  }

  private syncRoute(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: this.filterService.toRouteParams(),
      replaceUrl: true,
    }).catch((): void => undefined);
  }

  private reload(): void {
    const params = this.filterService.params();
    this.ready.set(true);

    this.loader.load(this.service.getCards(params), v => this.cardsData.set(v));
    this.loader.load(this.service.getDynamics(params), v => this.dynamicsData.set(v));
    this.loader.load(this.service.getPlanFact(params), v => this.planFactData.set(v));
    this.loader.load(this.service.getAcquiring(params), v => this.acquiringData.set(v));
    this.loader.load(this.service.getGeography(params), v => this.geographyData.set(v));
  }
}
