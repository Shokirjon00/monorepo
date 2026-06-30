import { AfterViewInit, Component, DestroyRef, inject, OnInit, signal, viewChild } from '@angular/core';
import { DatePipe, NgClass } from "@angular/common";
import { EMPaginationComponent } from "@shared/components/em-pagination/pagination.component";
import { EmHeaderComponent } from "@shared/components/em-header/em-header.component";
import { EskhataBankLoaderComponent } from "@shared/components/eskhata-bank-loader/eskhata-bank-loader.component";
import { NgxPermissionsModule } from "ngx-permissions";
import { TableComponent } from "@shared/components/table/table.component";
import { ICaption, IFilterParams, IPaginate } from "@core/interfaces";
import { ActivatedRoute, Params, Router } from "@angular/router";
import { isPhone } from "@core/helper";
import { MessageService } from "@core/services/message.service";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { parseFilterParams } from "@core/utils/filter-util";
import { ToastEnum } from "@core/enums/toast-enum";
import { AccountService } from "@modules/merchant-container/account/services/account.service";
import { IntegrationService } from "@modules/merchant-container/merchant/services/integration.service";
import { provideNgxMask } from "ngx-mask";
import { HistoryConstants } from "@modules/food/orders/history/history.constants";
import { historyOrdersService } from "@modules/food/orders/history/services/history.service";
import { IHistoryOrders } from "@modules/food/orders/history/interfaces/history.interface";
import { setDefaultFilterValue } from "@core/utils/route-param-parse";
import { finalize } from "rxjs";
import { TableConstants } from "@shared/components/table/table.constants";
import { restoreQueryParamsIfEmpty } from "@core/utils/restore-query-params";

@Component({
  standalone: true,
  selector: 'em-history',
  templateUrl: './history.component.html',
  styleUrl: './history.component.scss',
  imports: [
    DatePipe,
    EMPaginationComponent,
    EmHeaderComponent,
    EskhataBankLoaderComponent,
    NgxPermissionsModule,
    TableComponent,
    NgClass
  ],
  providers: [
    historyOrdersService,
    AccountService,
    IntegrationService,
    provideNgxMask()
  ]
})
export class HistoryComponent implements OnInit, AfterViewInit {
  readonly table = viewChild(TableComponent);

  loading = signal(false);
  orders: IHistoryOrders[] = [];
  tabMenuItems = HistoryConstants.HEADER_TABS;
  captions = HistoryConstants.HISTORY_COLUMNS;
  orderStatusClasses = TableConstants.orderStatusClasses;
  paginate: IPaginate | any;
  params: Params = {};
  captionKey = 'history';
  showScrollButton: boolean = false;

  readonly isMobile = isPhone();
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(historyOrdersService);
  private readonly messageService = inject(MessageService);

  private queryParams: IFilterParams = {
    filters: '',
    page: this.route.snapshot.queryParams['Page'] || 1,
    pageSize: 15
  };

  ngOnInit(): void {
    this.initRouteParams();
  }

  ngAfterViewInit(): void {
    this.captions.map((x: any, i: any,) => ({
      key: x,
      index: i,
      isSelected: true
    } as ICaption))
    this.table().render(this.captions, this.orders)
  }

  sortTable(value: string): void {
    let field = value.includes('.') ? value.split('.')[0] : value;
    this.queryParams.orderBy = value.startsWith('-') ? `${field.replace('-', '')} desc` : field;
    this.getHistoryOrders();
  }

  showDetail(historyId: string): void {
    this.router.navigate(['food/orders/history/info', historyId])
      .catch()
  }

  getStatusClass(name: string): string {
    return this.orderStatusClasses[name] ?? 'unknown';
  }

  private getHistoryOrders(params = this.queryParams): void {
    this.loading.set(true);
    this.service.getHistoryOrders(params)
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef))
      .subscribe(res => {
        if (res.status) {
          this.orders = res.data;
          this.paginate = res.meta.pagination;
        } else {
          this.messageService.add({severity: ToastEnum.ERROR, summary: res.message})
        }
      })
  }

  private initRouteParams(): void {
    this.route.queryParams
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res: Params) => {
        let params = {...res}
        params['IsArchived'] = 'true'
        this.queryParams = setDefaultFilterValue(params, this.captionKey);
        restoreQueryParamsIfEmpty(this.captionKey, this.route, this.router);
        this.queryParams.filter = parseFilterParams(params, this.queryParams, this.captions, []).filters;
        delete this.queryParams.filters;
        this.getHistoryOrders();
      });
  }
}
