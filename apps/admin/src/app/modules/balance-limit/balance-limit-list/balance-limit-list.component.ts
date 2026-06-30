import { AfterViewInit, Component, inject, OnInit, viewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TableComponent } from '@shared/components/table/table.component';
import { ICaption, IRowAction } from '@core/interfaces/table.interface';
import { DestroyableComponent } from '@core/abstract/destroyable.component';
import { BalanceLimitService } from '@modules/balance-limit/services/balance-limit.service';
import { finalize, takeUntil } from 'rxjs';
import { IBalanceLimit } from '@modules/balance-limit/Interfaces/balance-limit.interface';
import { IPaginate } from '@core/interfaces/paginate.interface';
import { IFilterParams } from '@core/interfaces/filter-params.interface';
import { parseFilterParams } from '@core/utils/filter-util';
import { CaptionService } from '@core/services/caption.service';
import { ITab } from '@core/interfaces/header.interface';
import { BalanceLimitListConstants } from '@modules/balance-limit/balance-limit-list/balance-limit-list.constants';
import { EmHeaderComponent } from '@shared/components/em-header/em-header.component';
import { EMPaginationComponent } from '@shared/components/em-pagination/pagination.component';
import { BalanceLimitConstants } from "@modules/balance-limit/balance-limit.constants";

@Component({
  standalone: true,
  selector: 'em-balance-limit-list',
  templateUrl: './balance-limit-list.component.html',
  styleUrls: ['./balance-limit-list.component.scss'],
  providers: [BalanceLimitService, CaptionService],
  imports: [TableComponent, EmHeaderComponent, EMPaginationComponent]
})
export class BalanceLimitListComponent extends DestroyableComponent implements AfterViewInit, OnInit {
  readonly table = viewChild(TableComponent);
  loading: boolean;
  balanceLimits: IBalanceLimit[];
  tabMenuItems: ITab[] = BalanceLimitConstants.HEADER_TABS;
  columns = BalanceLimitListConstants.BALANCE_LIMIT_LIST_COLUMNS;
  tableActions: IRowAction[] = BalanceLimitListConstants.TABLE_ACTIONS
  paginate: IPaginate | any;
  captionKey = 'balance-limit'

  private readonly router = inject(Router);
  private readonly service = inject(BalanceLimitService);
  private readonly route =inject(ActivatedRoute);

  private filterParams: IFilterParams = {
    page: this.route.snapshot.queryParams['Page'] || 1,
    sorts: '',
    pageSize: 15
  };

  ngOnInit(): void {
    this.route.queryParams
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => {
        const params = parseFilterParams(res, this.filterParams, this.columns);
        this.getBalanceLimits(params);
      });
  }

  ngAfterViewInit(): void {
    this.columns.map((x: any, i: any,) => ({
      key: x,
      index: i,
      isSelected: true
    } as ICaption));
    this.table().render(this.columns, this.balanceLimits);
  }

  update(): void {
    this.router.navigate(['/balance-limit/new']).catch();
  }

  edit(id: string): void {
    this.router.navigate(['/balance-limit/edit', id]).catch();
  }

  sortTable(value: string): void {
    this.filterParams.sorts = value;
    this.getBalanceLimits();
  }

  private getBalanceLimits(params = this.filterParams): void {
    this.loading = true;
    this.service.getBalanceLimits(params)
      .pipe(
        finalize(() => this.loading = false),
        takeUntil(this.destroyed$)
      )
      .subscribe(res => {
        if (res.status) {
          this.balanceLimits = res.data;
          this.paginate = res.meta.pagination;
        }
      });
  }

}
