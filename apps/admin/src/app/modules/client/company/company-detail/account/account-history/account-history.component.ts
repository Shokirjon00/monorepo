import { AfterViewInit, Component, inject, OnDestroy, OnInit, viewChild } from '@angular/core';
import { ICaption } from '@core/interfaces/table.interface';
import { IPaginate } from '@eskhata/util';
import { ActivatedRoute, Params } from '@angular/router';
import { IFilterParams } from '@core/interfaces/filter-params.interface';
import { IAccountHistory } from '@modules/client/company/interfaces/account-history.interface';
import { DestroyableComponent } from '@core/abstract/destroyable.component';
import { finalize, takeUntil } from 'rxjs';
import { parseFilterParams } from '@core/utils/filter-util';
import { TableComponent } from '@shared/components/table/table.component';
import { AccountService } from '@core/services/account.service';
import { AccountHistoryConstants } from "@modules/client/company/company-detail/account/account-history/account-history.constants";
import { ActionsComponent } from "@shared/components/actions/actions.component";
import { EMPaginationComponent } from "@shared/components/em-pagination/pagination.component";
import { EmHeaderComponent } from "@shared/components/em-header/em-header.component";

import { IAction } from "@shared/components/actions/actions.interface";
import { isEmptyObject, setDefaultFilterValue } from "@core/utils";

@Component({
  standalone: true,
  selector: 'em-account-history',
  templateUrl: './account-history.component.html',
  styleUrls: ['./account-history.component.scss'],
  providers: [AccountService],
  imports: [
    TableComponent,
    ActionsComponent,
    EMPaginationComponent,
    EmHeaderComponent
]
})
export class AccountHistoryComponent extends DestroyableComponent implements OnInit, AfterViewInit, OnDestroy {
  readonly table = viewChild(TableComponent);
  loading: boolean;
  accountsHistory: IAccountHistory[];
  actions: IAction[];
  columns = AccountHistoryConstants.ACCOUNT_HISTORY_COLUMNS;
  captionKey = 'account'
  paginate: IPaginate | any;
  params: Params = {}

  private readonly service = inject(AccountService);
  private readonly route = inject(ActivatedRoute);

  private queryParams: IFilterParams = {
    page: this.route.snapshot.queryParams['Page'] || 1,
    sorts: '',
    pageSize: 15
  };
  private accountId = this.route.snapshot.params['accountId'];


  ngOnInit(): void {
    this.initRouteParams()
  }

  ngAfterViewInit(): void {
    this.columns.map((x: any, i: any,) => ({
      key: x,
      index: i,
      isSelected: true
    } as ICaption));
    this.table().render(this.columns, this.accountsHistory)
  }

  sortTable(value: string): void {
    this.queryParams.sorts = value;
    this.getAccountHistories();
  }

  private getAccountHistories(params = this.queryParams): void {
    this.loading = true;
    this.service.getHistory(params, this.accountId)
      .pipe(
        finalize(() => this.loading = false),
        takeUntil(this.destroyed$)
      )
      .subscribe(res => {
        if (res.status) {
          this.accountsHistory = res.data;
          this.paginate = res.meta.pagination;
        }
      })
  }

  private initRouteParams(): void {
    this.route.queryParams
      .pipe(takeUntil(this.destroyed$))
      .subscribe((res: Params) => {
        if (!isEmptyObject(res)) {
          this.queryParams = setDefaultFilterValue(res, this.captionKey);
          const params = parseFilterParams(res, this.queryParams, this.columns);
          this.getAccountHistories(params);
        }
      });
    this.actions = AccountHistoryConstants.getAction(this.accountId)
  }
}
