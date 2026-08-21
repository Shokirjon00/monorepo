import { AfterViewInit, Component, inject, OnInit, viewChild } from '@angular/core';
import { DestroyableComponent } from '@eskhata/util';
import { ActionsComponent, EmHeaderComponent, EMPaginationComponent, TableComponent } from '@eskhata/ui';
import { ICaption, IRowAction } from '@eskhata/util';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { finalize, takeUntil } from 'rxjs';
import { CityService } from '@modules/directory/city/services/city.service';
import { ICity } from '@modules/directory/city/interfaces/city.interface';
import { IAction } from '@eskhata/util';
import { IPaginate } from '@eskhata/util';
import { IFilterParams } from '@eskhata/util';
import { ITab } from '@eskhata/util';
import { parseFilterParams } from '@core/utils/filter-util';
import { setDefaultFilterValue } from '@eskhata/util';
import { DirectoryConstants } from "@modules/directory/directory.constants";
import { CityConstants } from "@modules/directory/city/city.constants";

@Component({
  standalone: true,
  selector: 'em-city',
  templateUrl: './city.component.html',
  styleUrls: ['./city.component.scss'],
  imports: [TableComponent, ActionsComponent, EMPaginationComponent, EmHeaderComponent],
  providers: [CityService]
})

export class CityComponent extends DestroyableComponent implements OnInit, AfterViewInit {
  readonly table = viewChild(TableComponent);
  cities: ICity[];
  loading: boolean;
  tabMenuItems: ITab[] = DirectoryConstants.HEADER_TABS
  columns = CityConstants.CITY_COLUMNS;
  tableActions: IRowAction[] = CityConstants.TABLE_ACTIONS;
  captionKey = 'city';
  actions: IAction[] = CityConstants.CITY_ACTIONS
  paginate: IPaginate;

  private readonly router = inject(Router);
  private readonly service= inject(CityService);
  private readonly route = inject(ActivatedRoute);
  filterParams: IFilterParams = {
    page: this.route.snapshot.queryParams['Page'] || 1,
    pageSize: 15
  };
  params: Params = {}

  ngOnInit(): void {
    this.route.queryParams
      .pipe(takeUntil(this.destroyed$))
      .subscribe((res: Params) => {
        this.params = res;
        this.filterParams = setDefaultFilterValue(res, this.captionKey);
        const params = parseFilterParams(res, this.filterParams, this.columns);
        this.getCities(params);
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
    } as ICaption))
    this.table().render(this.columns, this.cities)
  }

  detail(cityId: string): void {
    this.router.navigate(['directory/city/info', cityId]).catch()
  }

  edit(cityId: string): void {
    this.router.navigate(['directory/city/edit', cityId]).catch()
  }

  sortTable(value: string): void {
    this.filterParams.sorts = value;
    this.getCities()
  }

  private getCities(params = this.filterParams): void {
    this.loading = true
    this.service.getCities(params)
      .pipe(
        finalize(() => this.loading = false),
        takeUntil(this.destroyed$)
      )
      .subscribe(res => {
        if (res.status) {
          this.cities = res.data;
          this.paginate = res.meta.pagination;
        }
      })
  }
}
