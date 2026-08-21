import { AfterViewInit, Component, inject, OnInit, viewChild } from '@angular/core';
import { DestroyableComponent } from '@eskhata/util';
import { ActionsComponent, EmHeaderComponent, EMPaginationComponent, TableComponent, ToastComponent } from '@eskhata/ui';
import { ICaption, IRowAction } from '@eskhata/util';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { RegionService } from '@modules/directory/region/services/region.service';
import { finalize, takeUntil } from 'rxjs';
import { IRegion } from '@modules/directory/region/interfaces/region.interface';
import { ITab } from '@eskhata/util';
import { IAction } from '@eskhata/util';
import { IPaginate } from '@eskhata/util';
import { IFilterParams } from '@eskhata/util';
import { parseFilterParams } from '@core/utils/filter-util';
import { setDefaultFilterValue } from '@eskhata/util';
import { DirectoryConstants } from "@modules/directory/directory.constants";
import { RegionConstants } from "@modules/directory/region/region.constants";

@Component({
  standalone: true,
  selector: 'em-region',
  templateUrl: './region.component.html',
  styleUrls: ['./region.component.scss'],
  providers: [RegionService],
  imports: [TableComponent, ToastComponent, ActionsComponent, EMPaginationComponent, EmHeaderComponent]
})

export class RegionComponent extends DestroyableComponent implements OnInit, AfterViewInit {
  readonly table = viewChild(TableComponent);
  regions: IRegion[];
  loading: boolean;
  tabMenuItems: ITab[] = DirectoryConstants.HEADER_TABS
  tableActions: IRowAction[] = RegionConstants.TABLE_ACTIONS
  captions = RegionConstants.REGION_COLUMNS;
  captionKey = 'region';
  actions: IAction[] = RegionConstants.REGION_ACTIONS
  paginate: IPaginate;

  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(RegionService);
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
        const params = parseFilterParams(res, this.filterParams, this.captions);
        this.getRegions(params);
        this.router.navigate([],
          {
            relativeTo: this.route,
            queryParams: this.params
          }).catch();
      });
  }

  ngAfterViewInit(): void {
    this.captions.map((x: any, i: any,) => ({
      key: x,
      index: i,
      isSelected: true
    } as ICaption));
    this.table().render(this.captions, this.regions);
  }

  detail(regionId: string): void {
    this.router.navigate(['directory/region/info', regionId])
      .catch()
  }

  edit(regionId: string): void {
    this.router.navigate(['directory/region/edit', regionId])
      .catch();
  }

  sortTable(value: string): void {
    this.filterParams.sorts = value;
    this.getRegions();
  }

  private getRegions(params = this.filterParams): void {
    this.loading = true;
    this.service.getRegions(params)
      .pipe(
        finalize(() => this.loading = false),
        takeUntil(this.destroyed$)
      )
      .subscribe(res => {
        if (res.status) {
          this.regions = res.data;
          this.paginate = res.meta.pagination;
        }
      })
  }
}
