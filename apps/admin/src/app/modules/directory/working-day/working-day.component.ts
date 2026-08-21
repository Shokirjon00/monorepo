import { AfterViewInit, Component, inject, OnInit, viewChild } from '@angular/core';
import { ActionsComponent, EmHeaderComponent, EMPaginationComponent, TableComponent, ToastComponent } from '@eskhata/ui';
import { DestroyableComponent } from '@eskhata/util';
import { ICaption, IRowAction } from '@eskhata/util';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { finalize, takeUntil } from 'rxjs';
import { WorkingDayService } from '@modules/directory/working-day/services/working-day.service';
import { IWorkingDay } from '@modules/directory/working-day/interfaces/working-day.interface';
import { ITab } from '@eskhata/util';
import { IAction } from '@eskhata/util';
import { IPaginate } from '@eskhata/util';
import { IFilterParams } from '@eskhata/util';
import { parseFilterParams } from '@core/utils/filter-util';
import { setDefaultFilterValue } from '@eskhata/util';
import { DirectoryConstants } from "@modules/directory/directory.constants";
import { WorkingdayConstant } from "@modules/directory/working-day/workingday.constant";

@Component({
  standalone: true,
  selector: 'em-working-day',
  templateUrl: './working-day.component.html',
  styleUrls: ['./working-day.component.scss'],
  providers: [WorkingDayService],
  imports: [
    TableComponent,
    ToastComponent,
    ActionsComponent,
    EMPaginationComponent,
    EmHeaderComponent
  ]
})
export class WorkingDayComponent extends DestroyableComponent implements OnInit, AfterViewInit {
  readonly table = viewChild(TableComponent);
  workingDays: IWorkingDay[];
  loading: boolean;
  tabMenuItems: ITab[] = DirectoryConstants.HEADER_TABS
  columns = WorkingdayConstant.WORKINGDAY_COLUMNS;
  tableActions: IRowAction[] = WorkingdayConstant.TABLE_ACTIONS
  actions: IAction[] = WorkingdayConstant.WORKING_DAY_ACTIONS
  paginate: IPaginate;

  private readonly router = inject(Router);
  private readonly service = inject(WorkingDayService);
  private readonly route = inject(ActivatedRoute);
  filterParams: IFilterParams = {
    page: this.route.snapshot.queryParams['Page'] || 1,
    sorts: '',
    pageSize: 15
  };
  captionKey = 'working-day';
  params: Params = {};


  ngOnInit(): void {
    this.route.queryParams
      .pipe(takeUntil(this.destroyed$))
      .subscribe((res: Params) => {
        this.params = res;
        this.filterParams = setDefaultFilterValue(res, this.captionKey);
        const params = parseFilterParams(res, this.filterParams, this.columns);
        this.getWorkDays(params);
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
    this.table().render(this.columns, this.workingDays)
  }

  edit(workingDayId: string): void {
    this.router.navigate(['directory/working-day/edit', workingDayId])
      .catch()
  }

  sortTable(value: string): void {
    this.filterParams.sorts = value;
    this.getWorkDays()
  }

  private getWorkDays(params = this.filterParams): void {
    this.loading = true;
    this.service.getWorkDays(params)
      .pipe(
        finalize(() => this.loading = false),
        takeUntil(this.destroyed$)
      )
      .subscribe(res => {
        if (res.status) {
          this.workingDays = res.data;
          this.paginate = res.meta.pagination;
        }
      })
  }
}
