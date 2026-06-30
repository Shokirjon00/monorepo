import { AfterViewInit, Component, inject, OnInit, viewChild } from '@angular/core';
import { TableComponent } from '@shared/components/table/table.component';
import { DestroyableComponent } from '@core/abstract/destroyable.component';
import { ICaption, IRowAction } from '@core/interfaces/table.interface';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { finalize, takeUntil } from 'rxjs';
import { WorkingDayService } from '@modules/directory/working-day/services/working-day.service';
import { IWorkingDay } from '@modules/directory/working-day/interfaces/working-day.interface';
import { ITab } from '@core/interfaces/header.interface';
import { IAction } from '@shared/components/actions/actions.interface';
import { IPaginate } from '@core/interfaces/paginate.interface';
import { IFilterParams } from '@core/interfaces/filter-params.interface';
import { parseFilterParams } from '@core/utils/filter-util';
import { setDefaultFilterValue } from '@core/utils/route-param-parse';
import { ToastComponent } from "@shared/components/toast/toast.component";
import { ActionsComponent } from "@shared/components/actions/actions.component";
import { EMPaginationComponent } from "@shared/components/em-pagination/pagination.component";
import { EmHeaderComponent } from "@shared/components/em-header/em-header.component";
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
