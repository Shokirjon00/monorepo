import { AfterViewInit, Component, inject, OnInit, signal, viewChild } from '@angular/core';
import { DestroyableComponent } from '@core/abstract/destroyable.component';
import { TableComponent } from '@shared/components/table/table.component';
import { ICaption, IRowAction } from '@core/interfaces/table.interface';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { RegionService } from '@modules/directory/region/services/region.service';
import { finalize, takeUntil } from 'rxjs';
import { IHeader } from '@core/interfaces/header.interface';
import { IAction } from '@shared/components/actions/actions.interface';
import { IPaginate } from '@eskhata/util';
import { IFilterParams } from '@core/interfaces/filter-params.interface';
import { parseFilterParams } from '@core/utils/filter-util';
import { setDefaultFilterValue } from '@core/utils/route-param-parse';
import { ToastComponent } from "@shared/components/toast/toast.component";
import { ServiceService } from "@modules/service/services/service.service";
import { IService } from "@modules/service/interfaces/service.interface";
import { ActionsComponent } from "@shared/components/actions/actions.component";
import { EMPaginationComponent } from "@shared/components/em-pagination/pagination.component";
import { EmHeaderComponent } from "@shared/components/em-header/em-header.component";
import { ServicesConstants } from "@modules/service/services.constants";
import { NgxPermissionsService } from "ngx-permissions";

@Component({
  standalone: true,
  selector: 'em-service',
  templateUrl: './service.component.html',
  styleUrls: ['./service.component.scss'],
  providers: [RegionService],
  imports: [TableComponent, ToastComponent, ActionsComponent, EMPaginationComponent, EmHeaderComponent]
})

export class ServiceComponent extends DestroyableComponent implements OnInit, AfterViewInit {
  readonly table = viewChild(TableComponent);
  regions: IService[];
  loading = signal(false);
  columns: any = ServicesConstants.SERVICES_COLUMNS;
  actions: IAction[] = ServicesConstants.SERVICES_ACTIONS
  tableActions: IRowAction[] = ServicesConstants.TABLE_ACTIONS
  captionKey = 'services';
  headerData: IHeader = {
    isFilter: true,
    tabShow: true,
    title: 'Сервисы'
  };
  paginate: IPaginate;

  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(ServiceService);
  private readonly permissionService = inject(NgxPermissionsService);

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
        this.getServices(params);
        this.router.navigate([],
          {
            relativeTo: this.route,
            queryParams: this.params
          }).catch();
      });
  }

  ngAfterViewInit(): void {
    this.columns.map((x: any, i: any,) => ({
      key: x,
      index: i,
      isSelected: true
    } as ICaption));
    this.table().render(this.columns, this.regions);
  }

  detail(regionId: string): void {
    this.router.navigate(['services/info', regionId])
      .catch()
  }

  edit(regionId: string): void {
    if (!this.permissionService.getPermission('ServiceDetail')) return;
    this.router.navigate(['services/edit', regionId])
      .catch();
  }

  sortTable(value: string): void {
    this.filterParams.sorts = value;
    this.getServices();
  }

  private getServices(params = this.filterParams): void {
    this.loading.set(true);
    this.service.getServices(params)
      .pipe(
        finalize(() => this.loading.set(false)),
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
