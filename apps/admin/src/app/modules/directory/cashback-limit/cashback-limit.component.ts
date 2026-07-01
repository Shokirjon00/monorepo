import { ActivatedRoute, Params, Router } from '@angular/router';
import { finalize, takeUntil } from 'rxjs';
import { ICaption, IRowAction } from '@core/interfaces/table.interface';
import { TableComponent } from '@shared/components/table/table.component';
import { AfterViewInit, Component, inject, OnInit, viewChild } from '@angular/core';
import { DestroyableComponent } from '@core/abstract/destroyable.component';
import { CashbackLimitService } from '@modules/directory/cashback-limit/services/cashback-limit.service';
import { ICashbackLimit } from '@modules/directory/cashback-limit/interfaces/cashback-limit.interface';
import { ITab } from '@core/interfaces/header.interface';
import { IAction } from '@shared/components/actions/actions.interface';
import { IPaginate } from '@eskhata/util';
import { IFilterParams } from '@core/interfaces/filter-params.interface';
import { parseFilterParams } from '@core/utils/filter-util';
import { setDefaultFilterValue } from '@core/utils/route-param-parse';
import { ActionsComponent } from "@shared/components/actions/actions.component";
import { EMPaginationComponent } from "@shared/components/em-pagination/pagination.component";
import { EmHeaderComponent } from "@shared/components/em-header/em-header.component";

import { DirectoryConstants } from "@modules/directory/directory.constants";
import { CashbackLimitConstants } from "@modules/directory/cashback-limit/cashback-limit.constants";

@Component({
  standalone: true,
  selector: 'em-cashback-limit',
  templateUrl: './cashback-limit.component.html',
  styleUrls: ['./cashback-limit.component.scss'],
  imports: [TableComponent, ActionsComponent, EMPaginationComponent, EmHeaderComponent],
  providers: [CashbackLimitService]
})
export class CashbackLimitComponent extends DestroyableComponent implements OnInit, AfterViewInit {
  readonly table = viewChild(TableComponent);
  cashbackLimits: ICashbackLimit[];
  loading: boolean;
  columns = CashbackLimitConstants.CASHBACK_LIMIT_COLUMNS
  tabMenuItems: ITab[] = DirectoryConstants.HEADER_TABS
  tableActions: IRowAction[] = CashbackLimitConstants.TABLE_ACTIONS;
  captionKey = 'cashback-limit';
  actions: IAction[] = CashbackLimitConstants.CASHBACK_LIMIT_ACTIONS
  paginate: IPaginate;

  private readonly router = inject(Router);
  private readonly service = inject(CashbackLimitService);
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
        this.getCashbackLimits(params);
        this.router.navigate([],
          {
            relativeTo: this.route,
            queryParams: this.params
          }).catch();
      })
  }

  ngAfterViewInit(): void {
    this.columns.map((x: any, i: any) => ({
      key: x,
      index: i,
      isSelected: true
    } as ICaption));
    this.table().render(this.columns, this.cashbackLimits)
  }

  detail(cashbackLimitId: string): void {
    this.router.navigate(['directory/cashback-limit/info', cashbackLimitId])
      .catch()
  }

  edit(cashbackLimitId: string): void {
    this.router.navigate(['directory/cashback-limit/edit', cashbackLimitId])
      .catch()
  }

  sortTable(value: string): void {
    this.filterParams.sorts = value;
    this.getCashbackLimits()
  }

  private getCashbackLimits(params = this.filterParams): void {
    this.loading = true;
    this.service.getCashbackLimits(params)
      .pipe(
        finalize(() => this.loading = false),
        takeUntil(this.destroyed$)
      )
      .subscribe(res => {
        if (res.status) {
          this.cashbackLimits = res.data;
          this.paginate = res.meta.pagination;
        }
      })
  }
}
