import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { IReview, IReviewsData } from '@modules/food/order-reviews/interfaces/reviews.interfaces';
import { DatePipe, NgClass,  } from '@angular/common';
import { EmHeaderComponent } from '@shared/components/em-header/em-header.component';
import { OrderReviewsService } from '@modules/food/order-reviews/services/order-reviews.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { InfiniteScrollDirective } from '@core/directives/infinite-scroll.directive';
import { finalize } from 'rxjs';
import { IFilterParams, IPaginate } from '@core/interfaces';
import { MultiDropdownComponent } from '@shared/components/multi-dropdown/multi-dropdown.component';
import { environment as env } from '@environments/environment';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderReviewsConstants } from '@modules/food/order-reviews/order-reviews.constants';
import { registerLocaleData } from '@angular/common';
import localeRu from '@angular/common/locales/ru';
registerLocaleData(localeRu);

@Component({
  selector: 'em-order-reviews',
  imports: [EmHeaderComponent, DatePipe, InfiniteScrollDirective, MultiDropdownComponent, NgClass],
  templateUrl: './order-reviews.component.html',
  styleUrl: './order-reviews.component.scss',
  providers: [OrderReviewsService],
})
export class OrderReviewsComponent implements OnInit {
  merchantApi = `${env.apiFoodUrl}/${env.api.dictionaries}/${env.api.restaurantPoints}`;
  selectedMerchant: { name: string; icon: string }[] = [{ name: 'Торговые точки', icon: 'checkmark-double.svg' }];
  selectedStars: { name: string; icon?: string }[] = [{ name: 'Все оценки', icon: 'checkmark-double.svg' }];
  selectedSortItem = [{ id: 'CreatedDateTime desc', name: 'Сначала новые' }];
  queryParams: IFilterParams | any = { page: 1 };
  selectedMerchantIds: string[] = [];

  protected readonly parseFloat = parseFloat;
  private readonly reviewsService = inject(OrderReviewsService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  readonly selectedRating = signal<any | null>(null);
  readonly selectedSort = signal<string>('CreatedDateTime desc');
  readonly reviewsData = signal<IReviewsData | null>(null);
  readonly allReviews = signal<IReview[]>([]);
  readonly allMerchantIds = signal<string[]>([]);
  readonly currentPage = signal<number>(1);
  readonly isLoading = signal<boolean>(false);
  readonly pageSize = 15;
  readonly ratingOptions = OrderReviewsConstants.RATING_OPTIONS;
  readonly sortOptions = OrderReviewsConstants.SORT_OPTIONS;
  readonly paginationInfo = computed<IPaginate>(() => {
    const data = this.reviewsData();
    const totalItems = parseInt(data?.chartData?.totalCount || '0');
    const currentCount = this.allReviews().length;
    const totalPages = Math.ceil(totalItems / this.pageSize);

    return {
      hasNextPage: currentCount < totalItems,
      hasPreviousPage: this.currentPage() > 1,
      pageNumber: this.currentPage(),
      totalItems: totalItems,
      totalPages: totalPages,
      pageSize: this.pageSize,
    };
  });

  getProgressBarClass(rating: string | number): string {
    const numericRating = +rating;

    if (numericRating >= 4) {
      return 'rating-row__progress-bar--high';
    }

    if (numericRating < 3) {
      return 'rating-row__progress-bar--low';
    }

    return '';
  }

  getRatingColorClass(rating: string | number): string {
    const numericRating = +rating;

    if (numericRating >= 4) {
      return 'rating--green';
    }

    if (numericRating === 3) {
      return 'rating--yellow';
    }

    if (numericRating <= 2) {
      return 'rating--red';
    }

    return '';
  }

  ngOnInit(): void {
    this.restoreFiltersFromUrl();
    this.fetchReviews();
  }

  private restoreFiltersFromUrl(): void {
    const params = this.route.snapshot.queryParams;

    if (params['filter']) {
      const ratingValue = params['filter'].split('=')[1];
      this.selectedRating.set(ratingValue);
      const ratingOpt = this.ratingOptions.find(o => o.id.toString() === ratingValue.toString());
      if (ratingOpt) {
        this.selectedStars = [ratingOpt];
      }
    }

    const merchantIdsFromUrl = params['merchantId'];

    if (merchantIdsFromUrl) {
      const ids = Array.isArray(merchantIdsFromUrl) ? merchantIdsFromUrl : [merchantIdsFromUrl];
      this.selectedMerchantIds = ids;
      this.selectedMerchant = [];
    } else {
      this.selectedMerchantIds = [];
      this.selectedMerchant = [{ name: 'Торговые точки', icon: 'checkmark-double.svg' }];
    }

    if (params['orderBy']) {
      this.selectedSort.set(params['orderBy']);
      const sortOpt = this.sortOptions.find(o => o.id === params['orderBy']);
      if (sortOpt) this.selectedSortItem = [sortOpt];
    }
  }

  ratingChange(event: any): void {
    this.selectedRating.set(event ?? null);
    this.updateQueryParams({ filter: event ? `Rating=${event}` : null });
    this.resetAndFetch();
  }

  sortChange(event: any): void {
    const val = event ?? 'CreatedDateTime desc';
    this.selectedSort.set(val);
    this.updateQueryParams({ orderBy: val });

    const selected = this.sortOptions.find(item => item.id === val);
    this.selectedSortItem = selected ? [selected] : [];
    this.resetAndFetch();
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

  clearRating(): void {
    this.selectedStars = [{ name: 'Все оценки', icon: 'checkmark-double.svg' }];
    this.selectedRating.set(null);

    this.updateQueryParams({ filter: null });

    this.resetAndFetch();
  }

  getStars(rating: number | string): number[] {
    return Array.from({ length: +rating });
  }

  fetchReviews(): void {
    if (this.isLoading()) return;
    this.isLoading.set(true);
    const params: any = {
      page: this.currentPage(),
      pageSize: this.pageSize,
      orderBy: this.selectedSort(),
    };

    if (this.selectedRating()) {
      params.filter = `Rating=${this.selectedRating()}`;
    }

    if (this.selectedMerchantIds.length) {
      params.RestaurantPointIds = this.selectedMerchantIds;
    }
    this.reviewsService
      .getReviews(params)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isLoading.set(false))
      )
      .subscribe({
        next: res => {
          if (res?.data) {
            this.reviewsData.set(res.data);

            this.allReviews.update(prev => [...prev, ...res.data.reviews]);
          }
        },
        error: err => console.error('Ошибка при загрузке отзывов:', err),
      });
  }

  onScroll(): void {
    if (this.paginationInfo().hasNextPage && !this.isLoading()) {
      this.currentPage.update(page => page + 1);
      this.fetchReviews();
    }
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
    this.currentPage.set(1);
    this.allReviews.set([]);
    this.fetchReviews();
  }
}
