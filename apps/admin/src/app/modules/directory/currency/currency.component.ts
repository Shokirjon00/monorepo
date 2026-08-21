import { AfterViewInit, Component, inject, OnInit, viewChild } from '@angular/core';
import { ActionsComponent, EmHeaderComponent, EMPaginationComponent, TableComponent, ToastComponent } from '@eskhata/ui';
import { ICaption, IRowAction } from '@eskhata/util';
import { ITab } from '@eskhata/util';
import { IAction } from '@eskhata/util';
import { IPaginate } from '@eskhata/util';
import { IFilterParams } from '@eskhata/util';
import { ActivatedRoute, Params, Router } from "@angular/router";
import { DestroyableComponent } from '@eskhata/util';
import { CurrencyService } from "@modules/directory/currency/services/currency.service";
import { finalize, takeUntil } from "rxjs";
import { setDefaultFilterValue } from '@eskhata/util';
import { parseFilterParams } from "@core/utils/filter-util";
import { AngularSvgIconModule } from "angular-svg-icon";
import { ReactiveFormsModule } from "@angular/forms";
import { NgxPermissionsModule } from "ngx-permissions";
import { ICurrency } from "@modules/directory/currency/interfaces/currency.interfaces";
import { CurrencyConstants } from "@modules/directory/currency/currency.constants";
import { DirectoryConstants } from "@modules/directory/directory.constants";

@Component({
  standalone: true,
  selector: 'em-currency',
  templateUrl: './currency.component.html',
  styleUrls: ['./currency.component.scss'],
  imports: [
    AngularSvgIconModule,
    ReactiveFormsModule,
    NgxPermissionsModule,
    ToastComponent,
    TableComponent,
    ActionsComponent,
    EMPaginationComponent,
    EmHeaderComponent
  ]
})
export class CurrencyComponent extends DestroyableComponent implements OnInit, AfterViewInit {
  readonly table = viewChild(TableComponent);
  currency: ICurrency[];
  loading: boolean;
  columns = CurrencyConstants.CURRENCY_COLUMNS
  tableActions: IRowAction[] = CurrencyConstants.TABLE_ACTIONS
  tabMenuItems: ITab[] = DirectoryConstants.HEADER_TABS
  captionKey = 'currency';
  actions: IAction[] = CurrencyConstants.CURRENCY_ACTIONS
  paginate: IPaginate;

  private readonly router = inject(Router);
  private readonly service = inject(CurrencyService);
  private readonly route = inject(ActivatedRoute);

  filterParams: IFilterParams = {
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
        this.getCurrencies(params);
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
    } as ICaption))
    this.table().render(this.columns, this.currency)
  }

  edit(currencyId: string): void {
    this.router.navigate(['directory/currency/edit', currencyId])
      .catch()
  }

  sortTable(value: string): void {
    this.filterParams.sorts = value;
    this.getCurrencies()
  }

  private getCurrencies(params = this.filterParams): void {
    this.loading = true
    this.service.getCurrency(params)
      .pipe(
        finalize(() => this.loading = false),
        takeUntil(this.destroyed$)
      )
      .subscribe(res => {
        if (res.status) {
          this.currency = res.data;
          this.paginate = res.meta.pagination;
        }
      })
  }
}
