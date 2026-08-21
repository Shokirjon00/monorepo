import { AfterViewInit, Component, DestroyRef, inject, OnInit, viewChild } from '@angular/core';
import { ActionsComponent, EmHeaderComponent, EMPaginationComponent, EskhataBankLoaderComponent, TableComponent } from '@eskhata/ui';
import { ICaption } from '@eskhata/util';
import { ActivatedRoute, Params, Router } from "@angular/router";
import { finalize } from "rxjs";
import { IFilterParams } from '@eskhata/util';
import { IPaginate, ToastEnum } from '@eskhata/util';
import { ICashback } from "@modules/merchant-container/cashback/interfaces/cashback.interface";
import { CashbackService } from "@modules/merchant-container/cashback/services/cashback.service";
import { parseFilterParams } from "@core/utils/filter-util";
import { isPhone } from '@core/helper';
import { NgxPermissionsService } from 'ngx-permissions';
import { MessageService } from '@eskhata/data-access';
import { SharedModule } from "@shared/shared.module";
import { DatePipe } from "@angular/common";
import { CashbackConstants } from "@modules/merchant-container/cashback/cashback.constants";
import { MerchantConstants } from "@modules/merchant-container/merchant/merchant.constants";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { restoreQueryParamsIfEmpty } from "@core/utils/restore-query-params";

@Component({
  standalone: true,
  selector: 'em-cashback-company',
  templateUrl: './cashback.component.html',
  styleUrls: ['./cashback.component.scss'],
  imports: [
    SharedModule,
    DatePipe,
    EskhataBankLoaderComponent,
    TableComponent,
    ActionsComponent,
    EMPaginationComponent,
    EmHeaderComponent
  ],
  providers: [CashbackService],
})
export class CashbackComponent implements OnInit, AfterViewInit {
  readonly table = viewChild(TableComponent);
  companyId: string;
  loading: boolean;
  cashCompanies: ICashback[];
  captions = CashbackConstants.CASHBACK_COLUMNS;
  tabMenuItems = MerchantConstants.HEADER_TABS;
  actions = CashbackConstants.CASHBACK_ACTION;
  captionKey = 'cashbackFiltersForm';
  paginate: IPaginate | any;
  params: Params = {};
  showScrollButton: boolean = false;
  readonly isMobile = isPhone();
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(CashbackService);
  private readonly messageService = inject(MessageService);
  private readonly permissionService = inject(NgxPermissionsService);

  private queryParams: IFilterParams = {
    filters: '',
    page: this.route.snapshot.queryParams['Page'] || 1,
    sorts: '',
    pageSize: 15
  };


  ngOnInit(): void {
    this.route.queryParams
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res) => {
        restoreQueryParamsIfEmpty(this.captionKey, this.route, this.router);
        this.params = res;
        this.queryParams.page = res['page']
        this.queryParams.pageSize = res['pageSize']
        const params = parseFilterParams(res, this.queryParams, this.captions);
        if (this.params['module'] && this.captionKey !== this.params['module']) {
          this.queryParams.page = 1
        } else {
          this.queryParams.module = this.captionKey;
        }
        this.getCashBacks(params)
      })
  }

  ngAfterViewInit(): void {
    this.captions.map((x: any, i: any,) => ({
      key: x,
      index: i,
      isSelected: true
    } as ICaption))
    this.table().render(this.captions, this.cashCompanies)
  }

  showDetail(id: string): void {
    if (!this.permissionService.getPermission('CashbackCompanyDetail')) return;
    this.router.navigate(['merchant/cashback/detail', id]).catch();
  }

  sortTable(value: string): void {
    this.queryParams.sorts = value;
    this.getCashBacks()
  }

  private getCashBacks(params = this.queryParams): void {
    this.loading = true;
    this.service.getCashbackCompanies(params)
      .pipe(
        finalize(() => this.loading = false),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(res => {
        if (res.status) {
          this.cashCompanies = res.data;
          this.paginate = res.meta.pagination;
        } else {
          this.messageService.add({severity: ToastEnum.ERROR, summary: res.message})
        }
        this.loading = false;
      })
  }
}
