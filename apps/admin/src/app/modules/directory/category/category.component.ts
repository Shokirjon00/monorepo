import { AfterViewInit, Component, inject, OnInit, viewChild } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { DestroyableComponent } from '@eskhata/util';
import { CategoryService } from '@modules/directory/category/services/category.service';
import { finalize, takeUntil } from 'rxjs';
import { ActionsComponent, EmHeaderComponent, EMPaginationComponent, TableComponent } from '@eskhata/ui';
import { ICaption, IRowAction } from '@eskhata/util';
import { ICategory } from '@modules/directory/category/interfaces/category.interface';
import { IAction } from '@eskhata/util';
import { ITab } from '@eskhata/util';
import { IPaginate } from '@eskhata/util';
import { IFilterParams } from '@eskhata/util';
import { parseFilterParams } from '@core/utils/filter-util';
import { setDefaultFilterValue } from '@eskhata/util';
import { CategoryConstants } from "@modules/directory/category/category.constants";
import { DirectoryConstants } from "@modules/directory/directory.constants";

@Component({
  standalone: true,
  selector: 'em-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.scss'],
  providers: [CategoryService],
  imports: [TableComponent, ActionsComponent, EMPaginationComponent, EmHeaderComponent]
})
export class CategoryComponent extends DestroyableComponent implements OnInit, AfterViewInit {
  readonly table = viewChild(TableComponent);
  categories: ICategory[];
  loading: boolean;
  columns = CategoryConstants.CATEGORY_COLUMNS;
  tableActions: IRowAction[] = CategoryConstants.TABLE_ACTIONS
  captionKey = 'category';
  actions: IAction[] = CategoryConstants.CATEGORY_ACTIONS;
  tabMenuItems: ITab[] = DirectoryConstants.HEADER_TABS
  paginate: IPaginate;

  private readonly router = inject(Router);
  private readonly service = inject(CategoryService);
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
        this.getCategories(params);
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
    this.table().render(this.columns, this.categories)
  }

  detail(categoryId: string): void {
    this.router.navigate(['directory/categories/info', categoryId])
      .catch()
  }

  edit(categoryId: string): void {
    this.router.navigate(['directory/categories/edit', categoryId])
      .catch()
  }

  sortTable(value: string): void {
    this.filterParams.sorts = value;
    this.getCategories()
  }

  private getCategories(params = this.filterParams): void {
    this.loading = true
    this.service.getCategories(params)
      .pipe(
        finalize(() => this.loading = false),
        takeUntil(this.destroyed$)
      )
      .subscribe(res => {
        if (res.status) {
          this.categories = res.data;
          this.paginate = res.meta.pagination;
        }
      })
  }
}
