import { AfterViewInit, Component, inject, OnInit, viewChild } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { DestroyableComponent } from '@eskhata/util';
import { SubcategoryService } from '@modules/directory/subcategory/services/subcategory.service';
import { finalize, takeUntil } from 'rxjs';
import { ActionsComponent, EmHeaderComponent, EMPaginationComponent, TableComponent } from '@eskhata/ui';
import { ICaption, IRowAction } from '@eskhata/util';
import { IAction } from '@eskhata/util';
import { ITab } from '@eskhata/util';
import { IPaginate } from '@eskhata/util';
import { IFilterParams } from '@eskhata/util';
import { parseFilterParams } from '@core/utils/filter-util';
import { ISubcategory } from '@modules/directory/subcategory/interfaces/subcategory.interface';
import { setDefaultFilterValue } from '@eskhata/util';
import { DirectoryConstants } from "@modules/directory/directory.constants";
import { SubcategoryConstants } from "@modules/directory/subcategory/subcategory.constants";

@Component({
  standalone: true,
  selector: 'em-category',
  templateUrl: './subcategory.component.html',
  styleUrls: ['./subcategory.component.scss'],
  providers: [SubcategoryService],
  imports: [TableComponent, ActionsComponent, EMPaginationComponent, EmHeaderComponent]
})
export class SubcategoryComponent extends DestroyableComponent implements OnInit, AfterViewInit {
  readonly table = viewChild(TableComponent);
  subcategories: ISubcategory[];
  loading: boolean;
  columns = SubcategoryConstants.SUBCATEGORY_COLUMNS
  tabMenuItems: ITab[] = DirectoryConstants.HEADER_TABS
  tableActions: IRowAction[] = SubcategoryConstants.TABLE_ACTIONS;
  captionKey = 'subcategory';
  actions: IAction[] = SubcategoryConstants.SUBCATEGORY_ACTIONS
  paginate: IPaginate;

  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(SubcategoryService);

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
        this.getSubcategories(params);
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
    this.table().render(this.columns, this.subcategories)
  }

  detail(subCategoryId: string): void {
    this.router.navigate(['directory/subcategories/info', subCategoryId])
      .catch()
  }

  edit(subCategoryId: string): void {
    this.router.navigate(['directory/subcategories/edit', subCategoryId])
      .catch()
  }

  sortTable(value: string): void {
    this.filterParams.sorts = value;
    this.getSubcategories();
  }

  private getSubcategories(params = this.filterParams): void {
    this.loading = true;
    this.service.getSubcategories(params)
      .pipe(
        finalize(() => this.loading = false),
        takeUntil(this.destroyed$)
      )
      .subscribe(res => {
        if (res.status) {
          this.subcategories = res.data;
          this.paginate = res.meta.pagination;
        }
      })
  }
}
