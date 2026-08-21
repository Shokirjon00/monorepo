import { AfterViewInit, Component, DestroyRef, inject, OnInit, signal, viewChild } from '@angular/core';
import { SupportCenterConstants } from '@modules/support-center/support-center.constants';
import { ActionsComponent, EmHeaderComponent, EMPaginationComponent, EskhataBankLoaderComponent, TableComponent, ToastModule } from '@eskhata/ui';
import { ICaption, IFilterParams, IPaginate } from "@core/interfaces";
import { ISupportCenter } from '@core/interfaces/support-center.interface';
import { IHttpResponse } from '@core/interfaces/http-response.interface';
import { combineLatest, finalize } from "rxjs";
import { ActivatedRoute, Params, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SupportCenterService } from '@modules/support-center/services/support-center.service';
import { distinctUntilChanged } from 'rxjs/operators';
import { parseFilterParams } from '@core/utils/filter-util';
import { IAction } from '@eskhata/util';
import { SupportCenterMobileCardComponent } from "@modules/support-center/support-center-mobile-card/support-center-mobile-card.component";
import { isPhone } from "@core/helper";

@Component({
  selector: 'em-support-center',
  standalone: true,
  imports: [
    EmHeaderComponent,
    TableComponent,
    EMPaginationComponent,
    ActionsComponent,
    ToastModule,
    EskhataBankLoaderComponent,
    SupportCenterMobileCardComponent
  ],
  templateUrl: './support-center.component.html',
  styleUrl: './support-center.component.scss',
  providers: [SupportCenterService],
})
export class SupportCenterComponent implements OnInit, AfterViewInit {
  readonly table = viewChild(TableComponent);
  tabMenuItems = SupportCenterConstants.HEADER_TABS;
  columns = SupportCenterConstants.SUPPORT_COLUMNS;
  actions: IAction[] = SupportCenterConstants.ACTIONS;
  support: ISupportCenter[];
  paginate: IPaginate | any;
  params: Params = {};
  readonly isMobile = isPhone();
  captionKey = 'support-center-cols';

  statusId = signal<string | null>(null);
  loading = signal(false);

  private readonly router = inject(Router)
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly service = inject(SupportCenterService);

  private queryParams: IFilterParams = {
    page: this.route.snapshot.queryParams['Page'] || 1,
    pageSize: 15
  };

  ngOnInit(): void {
    this.initRouteParams();
  }

  ngAfterViewInit(): void {
    this.columns.map((x: any, i: any,) => ({
      key: x,
      index: i,
      isSelected: true
    } as ICaption));
    this.table().render(this.columns, this.support);
  }

  sortTable(value: string): void {
    this.queryParams.sorts = value;
    this.getSupportCenters();
  }

  showDetail(id: string): void {
    this.router.navigate(['/help/detail', id]).catch();
  }

  private getSupportCenters(params = this.queryParams): void {
    this.loading.set(true);

    this.service.getSupportCenters(params)
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((res: IHttpResponse<ISupportCenter[]>) => {
        if (res.status) {
          this.support = res.data;
          this.paginate = res.meta.pagination;
        }
      })
  }

  private initRouteParams(): void {
    combineLatest([
      this.route.paramMap,
      this.route.queryParams.pipe(
        distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr))
      )
    ])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(([params, query]) => {
        const typeUrl = params.get('type') || 'all';
        this.params = {
          ...query
        };
        this.queryParams.page = +this.params['page'] || 1;
        this.queryParams.pageSize = +this.params['pageSize'] || 15;
        const statusId = SupportCenterConstants.getStatusIdFromPath(typeUrl);
        if (statusId) {
          this.params['SupportApplicationStatusId'] = statusId;
          this.statusId.set(statusId);
        } else {
          delete this.params['SupportApplicationStatusId'];
          this.statusId.set(null);
        }
        this.queryParams.filters = parseFilterParams(this.params, this.queryParams, this.columns).filters;
        this.getSupportCenters();
      });
  }
}
