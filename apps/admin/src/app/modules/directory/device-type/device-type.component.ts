import { AfterViewInit, Component, inject, OnInit, viewChild } from '@angular/core';
import { TableComponent } from '@shared/components/table/table.component';
import { DestroyableComponent } from '@core/abstract/destroyable.component';
import { ICaption, IRowAction } from '@core/interfaces/table.interface';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { finalize, takeUntil } from 'rxjs';
import { DeviceTypeService } from '@modules/directory/device-type/services/device-type.service';
import { IDeviceType } from '@modules/directory/device-type/interfaces/device-type.interface';
import { IAction } from '@shared/components/actions/actions.interface';
import { ITab } from '@core/interfaces/header.interface';
import { IPaginate } from '@core/interfaces/paginate.interface';
import { IFilterParams } from '@core/interfaces/filter-params.interface';
import { parseFilterParams } from '@core/utils/filter-util';
import { setDefaultFilterValue } from '@core/utils/route-param-parse'
import { ActionsComponent } from "@shared/components/actions/actions.component";
import { EMPaginationComponent } from "@shared/components/em-pagination/pagination.component";
import { EmHeaderComponent } from "@shared/components/em-header/em-header.component";
import { DirectoryConstants } from "@modules/directory/directory.constants";
import { DeviceTypeConstants } from "@modules/directory/device-type/device-type.constants";

@Component({
  standalone: true,
  selector: 'em-device-type',
  templateUrl: './device-type.component.html',
  styleUrls: ['./device-type.component.scss'],
  providers: [DeviceTypeService],
  imports: [TableComponent, ActionsComponent, EMPaginationComponent, EmHeaderComponent]
})
export class DeviceTypeComponent extends DestroyableComponent implements OnInit, AfterViewInit {
  readonly table = viewChild(TableComponent);
  deviceTypes: IDeviceType[];
  loading: boolean;
  columns = DeviceTypeConstants.DEVICE_TYPE_COLUMNS;
  tabMenuItems: ITab[] = DirectoryConstants.HEADER_TABS
  tableActions: IRowAction[] = DeviceTypeConstants.TABLE_ACTIONS
  captionKey = 'device-type';
  actions: IAction[] = DeviceTypeConstants.DEVICE_TYPE_ACTIONS
  paginate: IPaginate;

  private readonly router = inject(Router);
  private readonly service = inject(DeviceTypeService);
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
        this.getDeviceTypes(params);
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
    this.table().render(this.columns, this.deviceTypes)
  }

  detail(deviceTypeId: string): void {
    this.router.navigate(['directory/device-type/info', deviceTypeId])
      .catch()
  }

  edit(deviceTypeId: string): void {
    this.router.navigate(['directory/device-type/edit', deviceTypeId])
      .catch()
  }

  sortTable(value: string): void {
    this.filterParams.sorts = value;
    this.getDeviceTypes()
  }

  private getDeviceTypes(params = this.filterParams): void {
    this.loading = true
    this.service.getDeviceTypes(params)
      .pipe(
        finalize(() => this.loading = false),
        takeUntil(this.destroyed$)
      )
      .subscribe(res => {
        if (res.status) {
          this.deviceTypes = res.data;
          this.paginate = res.meta.pagination;
        }
      })
  }
}
