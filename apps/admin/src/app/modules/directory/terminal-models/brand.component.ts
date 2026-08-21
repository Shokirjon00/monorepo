import {AfterViewInit, Component, inject, OnInit, viewChild} from '@angular/core';
import { DestroyableComponent } from '@eskhata/util';
import { BrandService } from './services/brand.service';
import { ActionsComponent, EmHeaderComponent, EMPaginationComponent, TableComponent } from '@eskhata/ui';
import { finalize, takeUntil } from 'rxjs';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {ITab} from '@eskhata/util';
import {DirectoryConstants} from "@modules/directory/directory.constants";
import {ICaption, IFilterParams, IPaginate, IRowAction} from "@core/interfaces";
import {IAction} from '@eskhata/util';
import {parseFilterParams, setDefaultFilterValue} from "@core/utils";
import {IBrand} from "@modules/directory/terminal-models/interfaces/brand.interface";
import {BrandConstants} from "@modules/directory/terminal-models/brand.constants";

@Component({
  standalone: true,
  selector: 'em-brand',
  templateUrl: './brand.component.html',
  styleUrls: ['./brand.component.scss'],
  imports: [TableComponent, ActionsComponent, EMPaginationComponent, EmHeaderComponent]
})
export class BrandComponent extends DestroyableComponent implements OnInit, AfterViewInit {
  readonly table = viewChild(TableComponent);
  brand: IBrand[];
  loading: boolean;
  columns = BrandConstants.BRAND_COLUMNS
  tabMenuItems: ITab[] = DirectoryConstants.HEADER_TABS
  tableActions: IRowAction[] = BrandConstants.TABLE_ACTIONS;
  captionKey = 'brand';
  actions: IAction[] = BrandConstants.BRAND_ACTIONS
  paginate: IPaginate;

  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(BrandService);

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
        this.getBrand(params);
        this.router.navigate([],
          {
            relativeTo: this.route,
            queryParams: this.params
          }).catch();
      })
  }

  ngAfterViewInit(): void {
    this.columns.map((x: unknown, i: unknown,) => ({
      key: x,
      index: i,
      isSelected: true
    } as ICaption));
    this.table().render(this.columns, this.brand)
  }

  detail(brandId: string): void {
    this.router.navigate(['directory/terminal-models/info', brandId]).catch();
  }

  edit(brandId: string): void {
    this.router.navigate(['directory/terminal-models/edit', brandId]).catch();
  }

  sortTable(value: string): void {
    this.filterParams.sorts = value;
    this.getBrand();
  }

  private getBrand(params = this.filterParams): void {
    this.loading = true;
    this.service.getBrand(params)
      .pipe(
        finalize(() => this.loading = false),
        takeUntil(this.destroyed$)
      )
      .subscribe(res => {
        if (res.status) {
          this.brand = res.data;
          this.paginate = res.meta.pagination;
        }
      })
  }
}

