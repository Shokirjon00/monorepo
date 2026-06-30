import { AfterViewInit, Component, inject, OnInit, signal, viewChild } from '@angular/core';
import { TableComponent } from '@shared/components/table/table.component';
import { ICaption, IRowAction } from '@core/interfaces/table.interface';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { finalize, takeUntil } from 'rxjs';
import { DestroyableComponent } from '@core/abstract/destroyable.component';
import { IPaginate } from '@core/interfaces/paginate.interface';
import { IFilterParams } from '@core/interfaces/filter-params.interface';
import { ITab } from '@core/interfaces/header.interface';
import { parseFilterParams } from '@core/utils/filter-util';
import { setDefaultFilterValue } from '@core/utils/route-param-parse';
import { SettingService } from '@modules/setting-container/setting/services/setting.service';
import { ISetting } from '@modules/setting-container/setting/interfaces/setting.interface';
import { SettingConstants } from "@modules/setting-container/setting/setting.constants";
import { EMPaginationComponent } from "@shared/components/em-pagination/pagination.component";
import { EbLoaderComponent } from "@shared/components/eb-loader/eb-loader.component";
import { EmHeaderComponent } from "@shared/components/em-header/em-header.component";

@Component({
  standalone: true,
  selector: 'em-register-balance',
  templateUrl: './setting.component.html',
  styleUrls: ['./setting.component.scss'],
  providers: [SettingService],
  imports: [TableComponent, EMPaginationComponent, EbLoaderComponent, EmHeaderComponent]
})
export class SettingComponent extends DestroyableComponent implements AfterViewInit, OnInit {
  readonly table = viewChild(TableComponent);
  loading = signal(false);
  settings: ISetting[];
  columns: any = SettingConstants.SETTING_COLUMNS;
  tableActions: IRowAction[] = SettingConstants.TABLE_ACTIONS;
  tabMenuItems: ITab[] = SettingConstants.HEADER_TABS;
  paginate: IPaginate | any;
  captionKey = 'setting';
  params: Params = {};

  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(SettingService);

  private filterParams: IFilterParams = {
    page: this.route.snapshot.queryParams['Page'] || 1,
    sorts: '',
    pageSize: 15
  };

  ngOnInit(): void {
    this.route.queryParams
      .pipe(takeUntil(this.destroyed$))
      .subscribe((res: Params) => {
        this.params = res;
        this.filterParams = setDefaultFilterValue(res, this.captionKey);
        const params = parseFilterParams(res, this.filterParams, this.columns);
        this.getSettings(params);
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
    this.table().render(this.columns, this.settings);
  }

  sortTable(value: string): void {
    this.filterParams.sorts = value;
    this.getSettings()
  }

  edit(id: string): void {
    this.router.navigate(['/setting/system/edit', id])
      .catch()
  }

  settingEdit(settingId: string): void {
    this.router.navigate(['/setting/system/setting', settingId])
      .catch()
  }

  navigateToDetail(settingId: string): void {
    this.router.navigate(['/setting/system/info', settingId])
      .catch()
  }

  private getSettings(params = this.filterParams): void {
    this.loading.set(true);
    this.service.getSettings(params)
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntil(this.destroyed$)
      )
      .subscribe(res => {
        if (res.status) {
          this.settings = res.data;
          this.paginate = res.meta.pagination;
        }
      })
  }

}
