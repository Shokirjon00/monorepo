import { AfterViewInit, Component, inject, OnInit, viewChild } from '@angular/core';
import { ActionsComponent, EmHeaderComponent, EMPaginationComponent, TableComponent, ToastComponent } from '@eskhata/ui';
import { DestroyableComponent } from '@eskhata/util';
import { IAccountType } from '@modules/directory/account-type/interfaces/account-type.interface';
import { ICaption } from '@eskhata/util';
import { ITab } from '@eskhata/util';
import { IAction } from '@eskhata/util';
import { IPaginate } from '@eskhata/util';
import { IFilterParams } from '@eskhata/util';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { CaptionService } from '@core/services/caption.service';
import { finalize, takeUntil } from 'rxjs';
import { parseFilterParams } from '@core/utils/filter-util';
import { AccountTypeService } from '@modules/directory/account-type/services/account-type.service';
import { setDefaultFilterValue } from '@eskhata/util';
import { AccountTypeConstants } from "@modules/directory/account-type/account-type.constants";
import { DirectoryConstants } from "@modules/directory/directory.constants";
import { DataSourceService } from '@eskhata/data-access';

@Component({
  standalone: true,
  selector: 'em-account-type',
  templateUrl: './account-type.component.html',
  styleUrls: ['./account-type.component.scss'],
  imports: [
    TableComponent,
    ToastComponent,
    ActionsComponent,
    EMPaginationComponent,
    EmHeaderComponent
  ],
  providers: [
    AccountTypeService,
    DataSourceService
  ]
})
export class AccountTypeComponent extends DestroyableComponent implements AfterViewInit, OnInit {
  readonly table = viewChild(TableComponent);
  acTypes: IAccountType[];
  loading: boolean;
  columns = AccountTypeConstants.ACCOUNTTYPE_COLUMNS;
  tableActions = AccountTypeConstants.TABLE_ACTIONS;
  tabMenuItems: ITab[] = DirectoryConstants.HEADER_TABS;
  captionKey = 'account-type';
  actions: IAction[] = AccountTypeConstants.ACCOUNT_TYPE_ACTIONS;
  paginate: IPaginate;

  private readonly router = inject(Router);
  private readonly service = inject(AccountTypeService);
  private readonly route = inject(ActivatedRoute);
  private readonly captionService = inject(CaptionService);

  filterParams: IFilterParams = {
    page: this.route.snapshot.queryParams['Page'] || 1,
    sorts: '',
    pageSize: 15
  };
  params: Params = {};

  ngOnInit(): void {
    this.captionService.setCaption(this.columns, 'accountTypeFiltersForm');
    this.route.queryParams
      .pipe(takeUntil(this.destroyed$))
      .subscribe((res: Params) => {
        this.params = res;
        this.filterParams = setDefaultFilterValue(res, this.captionKey);
        const params = parseFilterParams(res, this.filterParams, this.columns);
        this.getAccountTypes(params);
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
    this.table().render(this.columns, this.acTypes)
  }

  edit(accountTypeId: string): void {
    this.router.navigate(['directory/account-type', accountTypeId, 'edit'])
  }

  sortTable(value: string): void {
    this.filterParams.sorts = value;
    this.getAccountTypes()
  }

  private getAccountTypes(params = this.filterParams): void {
    this.loading = true;
    this.service.getAccountTypes(params)
      .pipe(
        finalize(() => this.loading = false),
        takeUntil(this.destroyed$)
      )
      .subscribe(res => {
        if (res.status) {
          this.acTypes = res.data;
          this.paginate = res.meta.pagination;
        }
      })
  }
}
