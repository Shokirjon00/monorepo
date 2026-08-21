import { AfterViewInit, Component, inject, OnInit, viewChild } from '@angular/core';
import { DestroyableComponent } from '@eskhata/util';
import { ActionsComponent, EmHeaderComponent, EMPaginationComponent, TableComponent, ToastComponent } from '@eskhata/ui';
import { ICaption, IRowAction } from '@eskhata/util';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { finalize, takeUntil } from 'rxjs';
import { CountryService } from '@modules/directory/country/services/country.service';
import { ICountry } from '@modules/directory/country/interfaces/country.interface';
import { IAction } from '@eskhata/util';
import { ITab } from '@eskhata/util';
import { IPaginate } from '@eskhata/util';
import { IFilterParams } from '@eskhata/util';
import { parseFilterParams } from '@core/utils/filter-util';
import { setDefaultFilterValue } from '@eskhata/util';
import { DirectoryConstants } from "@modules/directory/directory.constants";
import { CountryConstants } from "@modules/directory/country/country.constants";

@Component({
  standalone: true,
  selector: 'em-country',
  templateUrl: './country.component.html',
  styleUrls: ['./country.component.scss'],
  providers: [CountryService],
  imports: [TableComponent, ToastComponent, ActionsComponent, EMPaginationComponent, EmHeaderComponent]
})
export class CountryComponent extends DestroyableComponent implements OnInit, AfterViewInit {
  readonly table = viewChild(TableComponent);
  countries: ICountry[];
  loading: boolean;
  columns = CountryConstants.COUNTRY_COLUMNS;
  tabMenuItems: ITab[] = DirectoryConstants.HEADER_TABS
  tableActions: IRowAction[] = CountryConstants.TABLE_ACTIONS
  actions: IAction[] = CountryConstants.COUNTRY_ACTIONS;
  captionKey = 'country';
  paginate: IPaginate;

  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(CountryService);
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
        this.getCountries(params);
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
    this.table().render(this.columns, this.countries)
  }

  detail(countryId: string): void {
    this.router.navigate(['directory/country/info', countryId])
      .catch()
  }

  edit(countryId: string): void {
    this.router.navigate(['directory/country/edit', countryId])
      .catch()
  }

  sortTable(value: string): void {
    this.filterParams.sorts = value;
    this.getCountries()
  }

  private getCountries(params = this.filterParams): void {
    this.loading = true
    this.service.getCountries(params)
      .pipe(
        finalize(() => this.loading = false),
        takeUntil(this.destroyed$)
      )
      .subscribe(res => {
        if (res.status) {
          this.countries = res.data;
          this.paginate = res.meta.pagination;
        }
      })
  }
}
