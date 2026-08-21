import { AfterViewInit, Component, DestroyRef, inject, OnInit, signal, viewChild } from '@angular/core';
import { ActionsComponent, EmHeaderComponent, EMPaginationComponent, TableComponent } from '@eskhata/ui';
import { ICaption, IFilterParams, IPaginate, IRowAction } from "@core/interfaces";
import { ActivatedRoute, Params, Router } from "@angular/router";
import { finalize } from "rxjs";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { isEmptyObject, parseFilterParams, setDefaultFilterValue } from "@core/utils";
import { ITab } from '@eskhata/util';
import { DirectoryConstants } from "@modules/directory/directory.constants";
import { AppealCategoryService } from "@modules/directory/appeal-category/services/appeal-category.service";
import { AppealCategoryConstants } from "@modules/directory/appeal-category/appeal-category.constants";
import { IAppealCategory } from "@modules/directory/appeal-category/interfaces/appeal-category.interface";

@Component({
  selector: 'em-appeal-category',
  standalone: true,
  imports: [
    EmHeaderComponent,
    TableComponent,
    ActionsComponent,
    EMPaginationComponent
  ],
  templateUrl: './appeal-category.component.html',
  styleUrl: './appeal-category.component.scss',
  providers:[AppealCategoryService]
})
export class AppealCategoryComponent implements OnInit, AfterViewInit {
  readonly table = viewChild(TableComponent);
  loading = signal(false);
  appealList: IAppealCategory[];
  tabMenuItems: ITab[] = DirectoryConstants.HEADER_TABS
  actions = AppealCategoryConstants.APPEAL_CATEGORY_ACTIONS;
  columns = AppealCategoryConstants.APPEAL_CATEGORY_COLUMNS;
  tableActions :IRowAction[] = AppealCategoryConstants.TABLE_ACTIONS;
  paginate: IPaginate | any;
  params: Params = {};
  captionKey = 'appeal-list-key';

  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private service = inject(AppealCategoryService)
  private queryParams: IFilterParams = {
    page: this.route.snapshot.queryParams['Page'] || 1,
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
    } as ICaption))
    this.table().render(this.columns, this.appealList)
  }

  sortTable(value: string): void {
    this.queryParams.sorts = value;
    this.getAppealList()
  }

  showDetail(categoryId: string): void {
    this.router.navigate(['directory/appeal-category/info', categoryId])
      .catch()
  }

  edit(categoryId: string): void {
    this.router.navigate(['directory/appeal-category/edit', categoryId])
      .catch()
  }

  private getAppealList(params = this.queryParams): void {
    this.loading.set(true);
    this.service.getCategories(params)
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(res => {
        if (res.status) {
          this.appealList = res.data
          this.paginate = res.meta.pagination;
        }
      })
  }

  private initRouteParams(): void {
    this.route.queryParams
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res: Params) => {
        if (!isEmptyObject(res)) {
          this.queryParams = setDefaultFilterValue(res, this.captionKey);
          const params = parseFilterParams(res, this.queryParams, this.columns);
          this.getAppealList(params);
        }
      });
  }

}
