import { AfterViewInit, Component, inject, OnInit, viewChild } from '@angular/core';
import { DestroyableComponent } from "@core/abstract/destroyable.component";
import { TableComponent } from "@shared/components/table/table.component";
import { ICaption, IRowAction } from "@core/interfaces/table.interface";
import { ITab } from "@core/interfaces/header.interface";
import { IPaginate } from '@eskhata/util';
import { IFilterParams } from "@core/interfaces/filter-params.interface";
import { ActivatedRoute, Params, Router } from "@angular/router";
import { finalize, takeUntil } from "rxjs";
import { setDefaultFilterValue } from "@core/utils/route-param-parse";
import { parseFilterParams } from "@core/utils/filter-util";
import { AngularSvgIconModule } from "angular-svg-icon";
import { NgxPermissionsModule } from "ngx-permissions";
import { ToastComponent } from "@shared/components/toast/toast.component";
import { IJobLogType } from "@modules/directory/job-log-types/interfaces/job-log-type";
import { TypeListService } from "@modules/directory/job-log-types/services/job-log-type.service";
import { DirectoryConstants } from "@modules/directory/directory.constants";
import { JobLogTypesConstants } from "@modules/directory/job-log-types/job-log-types.constants";
import { EMPaginationComponent } from "@shared/components/em-pagination/pagination.component";
import { EmHeaderComponent } from "@shared/components/em-header/em-header.component";

@Component({
  standalone: true,
  selector: 'em-job-log-typelist',
  templateUrl: './job-log-types.component.html',
  styleUrls: ['./job-log-types.component.scss'],
  imports: [
    AngularSvgIconModule,
    NgxPermissionsModule,
    ToastComponent,
    TableComponent,
    EMPaginationComponent,
    EmHeaderComponent
  ]
})
export class JobLogTypesComponent extends DestroyableComponent implements OnInit, AfterViewInit {
  readonly table = viewChild(TableComponent);
  typeList: IJobLogType[];
  loading: boolean;
  columns = JobLogTypesConstants.JOBLOGTYPE_COLUMNS;
  tableActions: IRowAction[] = JobLogTypesConstants.TABLE_ACTIONS
  tabMenuItems: ITab[] = DirectoryConstants.HEADER_TABS
  captionKey = 'typeList';
  paginate: IPaginate;

  private readonly router = inject(Router);
  private readonly service = inject(TypeListService);
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
        this.getJobLogTypes(params);
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
    this.table().render(this.columns, this.typeList)
  }

  edit(jobLogTypesId: string): void {
    this.router.navigate(['directory/job-log-types/edit', jobLogTypesId])
      .catch()
  }

  sortTable(value: string): void {
    this.filterParams.sorts = value;
    this.getJobLogTypes()
  }

  private getJobLogTypes(params = this.filterParams): void {
    this.loading = true
    this.service.getJobLogTypes(params)
      .pipe(
        finalize(() => this.loading = false),
        takeUntil(this.destroyed$)
      )
      .subscribe(res => {
        if (res.status) {
          this.typeList = res.data;
          this.paginate = res.meta.pagination;
        }
      })
  }
}
