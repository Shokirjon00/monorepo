import { ActivatedRoute, Params, Router } from '@angular/router';
import { finalize, takeUntil } from 'rxjs';
import { ICaption, IRowAction } from '@core/interfaces/table.interface';
import { IAction } from '@shared/components/actions/actions.interface';
import { IArea } from '@modules/directory/area/interfaces/area.interface';
import { TableComponent } from '@shared/components/table/table.component';
import { AreaService } from '@modules/directory/area/services/area.service';
import { AfterViewInit, Component, inject, OnInit, viewChild } from '@angular/core';
import { DestroyableComponent } from '@core/abstract/destroyable.component';
import { IFilterParams } from '@core/interfaces/filter-params.interface';
import { IPaginate } from '@core/interfaces/paginate.interface';
import { ITab } from '@core/interfaces/header.interface';
import { parseFilterParams } from '@core/utils/filter-util';
import { setDefaultFilterValue } from '@core/utils/route-param-parse';
import { ActionsComponent } from "@shared/components/actions/actions.component";
import { EMPaginationComponent } from "@shared/components/em-pagination/pagination.component";
import { EmHeaderComponent } from "@shared/components/em-header/em-header.component";
import { DirectoryConstants } from "@modules/directory/directory.constants";
import { AreaConstants } from "@modules/directory/area/area.constants";

@Component({
  standalone: true,
  selector: 'em-area',
  templateUrl: './area.component.html',
  styleUrls: ['./area.component.scss'],
  providers: [AreaService],
  imports: [TableComponent, ActionsComponent, EMPaginationComponent, EmHeaderComponent]
})
export class AreaComponent extends DestroyableComponent implements AfterViewInit, OnInit {
  readonly table = viewChild(TableComponent);

  areas: IArea[];
  loading: boolean;
  tabMenuItems: ITab[] = DirectoryConstants.HEADER_TABS;
  columns = AreaConstants.AREA_COLUMNS;
  tableActions: IRowAction[] = AreaConstants.TABLE_ACTIONS;
  captionKey = 'area';
  actions: IAction[] = AreaConstants.AREA_ACTIONS;
  paginate: IPaginate;

  private readonly router = inject(Router);
  private readonly service = inject(AreaService);
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
        this.getAreas(params);
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
    this.table().render(this.columns, this.areas)
  }

  detail(areaId: string): void {
    this.router.navigate(['directory/area/info', areaId])
      .catch()
  }

  edit(areaId: string): void {
    this.router.navigate(['directory/area/edit', areaId])
      .catch()
  }

  sortTable(value: string): void {
    this.filterParams.sorts = value;
    this.getAreas()
  }

  private getAreas(params = this.filterParams): void {
    this.loading = true;
    this.service.getAreas(params)
      .pipe(
        finalize(() => this.loading = false),
        takeUntil(this.destroyed$)
      )
      .subscribe(res => {
        if (res.status) {
          this.areas = res.data;
          this.paginate = res.meta.pagination;
        }
      })
  }
}
