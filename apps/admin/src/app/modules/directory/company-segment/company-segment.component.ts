import { AfterViewInit, Component, inject, OnInit, viewChild } from '@angular/core';
import { DestroyableComponent } from '@eskhata/util';
import { ActionsComponent, EmHeaderComponent, EMPaginationComponent, TableComponent } from '@eskhata/ui';
import { ICompanySegment } from '@modules/directory/company-segment/interfaces/company-segment.interface';
import { IAction } from '@eskhata/util';
import { ICaption, IRowAction } from '@eskhata/util';
import { ITab } from '@eskhata/util';
import { IPaginate } from '@eskhata/util';
import { IFilterParams } from '@eskhata/util';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { finalize, takeUntil } from 'rxjs';
import { parseFilterParams } from '@core/utils/filter-util';
import { CompanySegmentService } from '@modules/directory/company-segment/services/company-segment.service';
import { setDefaultFilterValue } from '@eskhata/util';
import { CompanySegmentConstants } from "@modules/directory/company-segment/company-segment.constants";
import { DirectoryConstants } from "@modules/directory/directory.constants";
import { NgxPermissionsService } from "ngx-permissions";

@Component({
  standalone: true,
  selector: 'em-company-segment',
  templateUrl: './company-segment.component.html',
  styleUrls: ['./company-segment.component.scss'],
  providers: [CompanySegmentService],
  imports: [TableComponent, ActionsComponent, EMPaginationComponent, EmHeaderComponent]
})
export class CompanySegmentComponent extends DestroyableComponent implements OnInit, AfterViewInit {
  readonly table = viewChild(TableComponent);
  loading: boolean;
  companySegments: ICompanySegment[];
  actions: IAction[] = CompanySegmentConstants.COMPANY_SEGMENT_ACTIONS
  columns = CompanySegmentConstants.COMPANYSEGMENT_COLUMNS;
  tableActions: IRowAction[] = CompanySegmentConstants.TABLE_ACTIONS
  tabMenuItems: ITab[] = DirectoryConstants.HEADER_TABS
  captionKey = 'company-segment';
  paginate: IPaginate;

  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(CompanySegmentService);
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
        this.getCompanySegments(params);
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
    this.table().render(this.columns, this.companySegments)
  }

  detail(segmentId: string): void {
    if (!this.permissionService.getPermission('CompanySegmentDetail')) return;
    this.router.navigate(['directory/company-segment/info', segmentId])
      .catch()
  }

  edit(segmentId: string): void {
    this.router.navigate(['directory/company-segment/edit', segmentId])
      .catch()
  }

  sortTable(value: string): void {
    this.filterParams.sorts = value;
    this.getCompanySegments()
  }

  private getCompanySegments(params = this.filterParams): void {
    this.loading = true;
    this.service.getCompanySegments(params)
      .pipe(
        finalize(() => this.loading = false),
        takeUntil(this.destroyed$)
      )
      .subscribe(res => {
        if (res.status) {
          this.companySegments = res.data;
          this.paginate = res.meta.pagination;
        }
      })
  }
}
