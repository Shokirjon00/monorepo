import { AfterViewInit, Component, DestroyRef, inject, OnInit, signal, viewChild} from '@angular/core';
import { ActionsComponent, EmHeaderComponent, EMPaginationComponent, TableComponent } from '@eskhata/ui';
import { ICashbackRates } from "@modules/directory/cashback-rates/interfaces/cashback-rates.interface";
import { IAction } from '@eskhata/util';
import { ICaption, IFilterParams, IPaginate, IRowAction } from "@core/interfaces";
import { ITab } from '@eskhata/util';
import { DirectoryConstants } from "@modules/directory/directory.constants";
import { ActivatedRoute, Params, Router } from "@angular/router";
import { CashbackRatesService } from "@modules/directory/cashback-rates/services/cashback-rates.service";
import { finalize } from "rxjs";
import { isEmptyObject, parseFilterParams, setDefaultFilterValue } from "@core/utils";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { IncomeCodeConstants } from "@modules/directory/income-code/income-code.contants";
import { IncomeCode } from "@modules/directory/income-code/services/income-code";
import { IIncomeCode } from "@modules/directory/income-code/interfaces/income-code";

@Component({
  selector: 'em-income-code',
  imports: [
    EmHeaderComponent,
    TableComponent,
    ActionsComponent,
    EMPaginationComponent
  ],
  templateUrl: './income-code.component.html',
  styleUrl: './income-code.component.scss',
  providers:[IncomeCode]
})
export class IncomeCodeComponent implements OnInit, AfterViewInit {
  readonly table = viewChild(TableComponent);
  loading = signal(false);
  incomeCodes: IIncomeCode[];
  actions: IAction[] = IncomeCodeConstants.INCOME_CODE_ACTIONS
  tableActions: IRowAction[] = IncomeCodeConstants.TABLE_ACTIONS
  columns = IncomeCodeConstants.INCOME_CODE_COLUMNS;
  tabMenuItems: ITab[] = DirectoryConstants.HEADER_TABS
  captionKey = 'income-code';
  paginate: IPaginate;
  params: Params = {};

  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(IncomeCode);
  private readonly destroyRef = inject(DestroyRef);
  filterParams: IFilterParams = {
    filters: '',
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
    this.table().render(this.columns, this.incomeCodes);
  }

  edit(cashbackRatesId: string): void {
    this.router.navigate(['directory/income-code/edit', cashbackRatesId]).catch();
  }

  sortTable(value: string): void {
    this.filterParams.sorts = value;
    this.getIncomeCode();
  }

  private getIncomeCode(params = this.filterParams): void {
    this.loading.set(true);
    this.service.getIncomeCode(params)
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(res => {
        if (res.status) {
          this.incomeCodes = res.data;
          this.paginate = res.meta.pagination;
        }
      })
  }

  private initRouteParams(): void {
    this.route.queryParams
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res: Params) => {
        if (!isEmptyObject(res)) {
          this.filterParams = setDefaultFilterValue(res, this.captionKey);
          const params = parseFilterParams(res, this.filterParams, this.columns);
          this.getIncomeCode(params);
        }
      });
  }
}
