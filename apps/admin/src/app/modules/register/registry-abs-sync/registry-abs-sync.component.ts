import { AfterViewInit, Component, inject, OnInit, viewChild } from '@angular/core';
import { ActionsComponent, EmHeaderComponent, EMPaginationComponent, TableComponent } from '@eskhata/ui';
import { DestroyableComponent } from '@eskhata/util';
import { ICaption } from '@eskhata/util';
import { IAction } from '@eskhata/util';
import { IPaginate } from '@eskhata/util';
import { ActivatedRoute, Params, Router } from "@angular/router";
import { IFilterParams } from '@eskhata/util';
import { finalize, takeUntil } from "rxjs";
import { setDefaultFilterValue } from '@eskhata/util';
import { parseFilterParams } from "@core/utils/filter-util";
import { IRegistryAbsSync } from "@modules/register/registry-abs-sync/interfaces/registry-abs-sync";
import { RegistryAbsSyncService } from "@modules/register/registry-abs-sync/services/registry-abs-sync.service";
import {
  RegistryAbsSync,
} from "@modules/register/registry-abs-sync/registry-abs-sync.constants";
import { ITab } from '@eskhata/util';
import { isEmptyObject } from "@core/utils";

@Component({
  standalone: true,
  selector: 'em-registry-abs-sync',
  templateUrl: './registry-abs-sync.component.html',
  styleUrls: ['./registry-abs-sync.component.scss'],
  imports: [TableComponent, ActionsComponent, EMPaginationComponent, EmHeaderComponent],
  providers: [RegistryAbsSyncService]
})
export class RegistryAbsSyncComponent extends DestroyableComponent implements AfterViewInit, OnInit {
  readonly table = viewChild(TableComponent);
  loading: boolean;
  registerAbsSync: IRegistryAbsSync[];
  columns = RegistryAbsSync.REGISTRY_ABS_SYNC_COLUMNS;
  tabMenuItems: ITab[] = RegistryAbsSync.HEADER_TABS;
  actions: IAction[] = RegistryAbsSync.REGISTRY_ABS_SYNC_ACTIONS;
  paginate: IPaginate | any;
  captionKey = 'register-abs-sync-cols';
  params: Params = {};

  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(RegistryAbsSyncService);
  private filterParams: IFilterParams = {
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
    this.table().render(this.columns, this.registerAbsSync);
  }

  sortTable(value: string): void {
    this.filterParams.sorts = value;
    this.getRegistryAbsSync()
  }

  link(dataDetail: { dataSourceId: string, fieldName: string }): void {
    if (dataDetail.fieldName === 'companyName') {
      const companyId = this.registerAbsSync.find(item => item.id === dataDetail.dataSourceId).companyId;
      this.router.navigate(['clients/company', companyId]).catch();
    }
  }

  private initRouteParams(): void {
    this.route.queryParams
      .pipe(takeUntil(this.destroyed$))
      .subscribe((res: Params) => {
        if (!isEmptyObject(res)) {
          this.filterParams = setDefaultFilterValue(res, this.captionKey);
          const params = parseFilterParams(res, this.filterParams, this.columns);
          this.getRegistryAbsSync(params);
        }
      })
  }

  private getRegistryAbsSync(params = this.filterParams): void {
    this.loading = true;
    this.service.getRegistryAbsSync(params)
      .pipe(
        finalize(() => this.loading = false),
        takeUntil(this.destroyed$)
      )
      .subscribe(res => {
        if (res.status) {
          this.registerAbsSync = res.data;
          this.paginate = res.meta.pagination;
        }
      })
  }
}
