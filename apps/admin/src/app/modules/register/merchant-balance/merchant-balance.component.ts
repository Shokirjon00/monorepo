import { AfterViewInit, Component, inject, OnInit, signal, viewChild } from '@angular/core';
import { TableComponent } from '@shared/components/table/table.component';
import { ICaption } from '@core/interfaces/table.interface';
import { ActivatedRoute, Params } from '@angular/router';
import { finalize, takeUntil } from 'rxjs';
import { DestroyableComponent } from '@core/abstract/destroyable.component';
import { IPaginate } from '@eskhata/util';
import { IFilterParams } from '@core/interfaces/filter-params.interface';
import { parseFilterParams } from '@core/utils/filter-util';
import { setDefaultFilterValue } from '@core/utils/route-param-parse';
import { MerchantBalanceService } from '@modules/register/merchant-balance/services/merchant-balance.service';
import { IMerchantBalance } from '@modules/register/merchant-balance/interfaces/merchant-balance.interface';
import { MerchantBalanceConstants } from "@modules/register/merchant-balance/merchant-balance.constants";
import { EmHeaderComponent } from "@shared/components/em-header/em-header.component";
import { ITab } from "@core/interfaces/header.interface";
import { EMPaginationComponent } from "@shared/components/em-pagination/pagination.component";
import { isEmptyObject } from "@core/utils";

@Component({
  standalone: true,
  selector: 'em-merchant-balance',
  templateUrl: './merchant-balance.component.html',
  styleUrls: ['./merchant-balance.component.scss'],
  imports: [TableComponent, EmHeaderComponent, EMPaginationComponent],
  providers: [MerchantBalanceService]
})
export class MerchantBalanceComponent extends DestroyableComponent implements AfterViewInit, OnInit {
  readonly table = viewChild(TableComponent);
  loading = signal(false);
  registerBalanceData: IMerchantBalance[];
  columns = MerchantBalanceConstants.MERCHANT_BALANCE_COLUMNS;
  tabMenuItems: ITab[] = MerchantBalanceConstants.HEADER_TABS;
  paginate: IPaginate | any;
  captionKey = 'merchant-balance-cols';
  params: Params = {};
  fileStorageUrl: string;
  fileStorageToken: string;

  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(MerchantBalanceService);
  private filterParams: IFilterParams = {
    page: this.route.snapshot.queryParams['Page'] || 1,
    sorts: '',
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
    this.table().render(this.columns, this.registerBalanceData);
  }

  sortTable(value: string): void {
    this.filterParams.sorts = value;
    this.getBalances()
  }

  private initRouteParams(): void {
    this.route.queryParams
      .pipe(takeUntil(this.destroyed$))
      .subscribe((res: Params) => {
        if (!isEmptyObject(res)) {
          this.filterParams = setDefaultFilterValue(res, this.captionKey);
          const params = parseFilterParams(res, this.filterParams, this.columns);
          this.getBalances(params);
        }
      })
  }

  private getBalances(params = this.filterParams): void {
    this.loading.set(true);
    this.service.getBalances(params)
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntil(this.destroyed$)
      )
      .subscribe(res => {
        if (res.status) {
          this.registerBalanceData = res.data;
          this.fileStorageUrl = res.meta.fileStorageUrl;
          this.fileStorageToken = res.meta.fileStorageToken;
          this.paginate = res.meta.pagination;
        }
      })
  }
}
