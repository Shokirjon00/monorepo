import { AfterViewInit, Component, inject, OnInit, signal, viewChild } from '@angular/core';
import { DestroyableComponent } from '@core/abstract/destroyable.component';
import { TableComponent } from '@shared/components/table/table.component';
import { ICaption, IRowAction } from '@core/interfaces/table.interface';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { finalize, takeUntil } from 'rxjs';
import { CashbackRatesService } from '@modules/directory/cashback-rates/services/cashback-rates.service';
import { ICashbackRates } from '@modules/directory/cashback-rates/interfaces/cashback-rates.interface';
import { IAction } from '@shared/components/actions/actions.interface';
import { ITab } from '@core/interfaces/header.interface';
import { IPaginate } from '@core/interfaces/paginate.interface';
import { IFilterParams } from '@core/interfaces/filter-params.interface';
import { parseFilterParams } from '@core/utils/filter-util';
import { setDefaultFilterValue } from '@core/utils/route-param-parse';
import { ActionsComponent } from "@shared/components/actions/actions.component";
import { EmHeaderComponent } from "@shared/components/em-header/em-header.component";
import { DirectoryConstants } from "@modules/directory/directory.constants";
import { EMPaginationComponent } from "@shared/components/em-pagination/pagination.component";
import { CashbackRatesConstants } from "@modules/directory/cashback-rates/cashback-rates.constants";

@Component({
  standalone: true,
  selector: 'em-cashback-rates',
  templateUrl: './cashback-rates.component.html',
  styleUrls: ['./cashback-rates.component.scss'],
  providers: [CashbackRatesService],
  imports: [TableComponent, ActionsComponent, EmHeaderComponent, EMPaginationComponent]
})
export class CashbackRatesComponent extends DestroyableComponent implements OnInit, AfterViewInit {
  readonly table = viewChild(TableComponent);
  loading = signal(false);
  cashbackes: ICashbackRates[];
  actions: IAction[] = CashbackRatesConstants.CASHBACK_RATES_ACTIONS
  tableActions: IRowAction[] = CashbackRatesConstants.TABLE_ACTIONS
  columns = CashbackRatesConstants.CASHBACKRATES_COLUMNS;
  tabMenuItems: ITab[] = DirectoryConstants.HEADER_TABS
  captionKey = 'cashback-rates';
  paginate: IPaginate;
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(CashbackRatesService);
  filterParams: IFilterParams = {
    filters: '',
    page: this.route.snapshot.queryParams['Page'] || 1,
    sorts: '',
    pageSize: 15
  };
  params: Params = {};

  ngOnInit(): void {
    this.route.queryParams
      .pipe(takeUntil(this.destroyed$))
      .subscribe((res: Params) => {
        this.params = res;
        this.filterParams = setDefaultFilterValue(res, this.captionKey);
        const params = parseFilterParams(res, this.filterParams, this.columns);
        this.getCashbacks(params);
        this.router.navigate([],
          {
            relativeTo: this.route,
            queryParams: this.params
          }).catch();
      })
  }


  ngAfterViewInit(): void {
    this.columns.map((x: any, i: any,) => ({
      key: x,
      index: i,
      isSelected: true
    } as ICaption));
    this.table().render(this.columns, this.cashbackes);
  }

  detail(cashbackRatesId: string): void {
    this.router.navigate(['directory/cashback-rates/info', cashbackRatesId]).catch();
  }

  edit(cashbackRatesId: string): void {
    this.router.navigate(['directory/cashback-rates/edit', cashbackRatesId]).catch();
  }

  sortTable(value: string): void {
    this.filterParams.sorts = value;
    this.getCashbacks();
  }

  private getCashbacks(params = this.filterParams): void {
    this.loading.set(true);
    this.service.getCashbackes(params)
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntil(this.destroyed$)
      )
      .subscribe(res => {
        if (res.status) {
          this.cashbackes = res.data;
          this.paginate = res.meta.pagination;
        }
      })
  }
}
