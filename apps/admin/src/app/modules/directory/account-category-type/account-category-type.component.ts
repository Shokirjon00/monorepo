import { AfterViewInit, Component, DestroyRef, inject, OnInit, viewChild } from '@angular/core';
import { ICaption, IRowAction } from '@eskhata/util';
import { ITab } from '@eskhata/util';
import { IAction } from '@eskhata/util';
import { IPaginate } from '@eskhata/util';
import { IFilterParams } from '@eskhata/util';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { ActionsComponent, EmHeaderComponent, EMPaginationComponent, TableComponent, ToastComponent } from '@eskhata/ui';
import {
  IAccountCategoryType
} from '@modules/directory/account-category-type/interfaces/account-category-type.interface';
import {
  AccountCategoryTypeService
} from '@modules/directory/account-category-type/services/account-category-type.service';
import { DestroyableComponent } from '@eskhata/util';
import { finalize, takeUntil } from 'rxjs';
import { parseFilterParams } from '@core/utils/filter-util';
import { setDefaultFilterValue } from '@eskhata/util';
import {
  AccountCategoriesTypeConstants
} from "@modules/directory/account-category-type/account-category-type.constants";
import { DirectoryConstants } from "@modules/directory/directory.constants";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { isEmptyObject } from "@core/utils";

@Component({
  standalone: true,
  selector: 'em-account-category-type',
  templateUrl: './account-category-type.component.html',
  styleUrls: ['./account-category-type.component.scss'],
  providers: [AccountCategoryTypeService],
  imports: [
    TableComponent,
    ToastComponent,
    ActionsComponent,
    EMPaginationComponent,
    EmHeaderComponent
  ]
})
export class AccountCategoryTypeComponent implements OnInit, AfterViewInit {
  readonly table = viewChild(TableComponent);
  acCatTypes: IAccountCategoryType[];
  loading: boolean;
  columns = AccountCategoriesTypeConstants.ACCOUNTCATEGORYTYPE_COLUMNS
  tableActions: IRowAction[] = AccountCategoriesTypeConstants.TABLE_ACTIONS
  tabMenuItems: ITab[] = DirectoryConstants.HEADER_TABS
  captionKey = 'account-category-type';
  actions: IAction[] = AccountCategoriesTypeConstants.CATEGORY_TYPE_ACTIONS
  paginate: IPaginate;

  params: Params = {};
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(AccountCategoryTypeService)
  private readonly destroyRef = inject(DestroyRef);

  filterParams: IFilterParams = {
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
    this.table().render(this.columns, this.acCatTypes)
  }

  detail(acCategoryTypeId: string): void {
    this.router.navigate(['directory/account-category-type/detail', acCategoryTypeId, 'info'])
      .catch()
  }

  edit(acCategoryTypeId: string): void {
    this.router.navigate(['directory/account-category-type/detail/', acCategoryTypeId, 'edit'])
      .catch()
  }

  sortTable(value: string): void {
    this.filterParams.sorts = value;
    this.getAccountCategoryTypes()
  }

  private getAccountCategoryTypes(params = this.filterParams): void {
    this.loading = true;
    this.service.getAccountCategoryTypes(params)
      .pipe(
        finalize(() => this.loading = false),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(res => {
        if (res.status) {
          this.acCatTypes = res.data;
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
          this.getAccountCategoryTypes(params);
        }
      });
  }
}
