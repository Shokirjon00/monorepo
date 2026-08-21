import { AfterViewInit, Component, DestroyRef, inject, OnInit, signal, viewChild } from '@angular/core';
import { IFilterParams } from '@eskhata/util';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { finalize, Subscription, takeUntil } from 'rxjs';
import { DestroyableComponent } from '@eskhata/util';
import { IPaginate } from '@eskhata/util';
import { ICaption } from '@eskhata/util';
import { parseFilterParams } from '@core/utils/filter-util';
import { EmHeaderComponent, EMPaginationComponent, TableComponent } from '@eskhata/ui';
import { ITab } from '@eskhata/util';
import { IJobLog } from '@modules/job-log/interfaces/job-log.interface';
import { JobLogService } from '@modules/job-log/services/job-log.service';
import { MainJournalConstants } from '@modules/job-log/job-log/main-journal.constants';
import { isEmptyObject, setDefaultFilterValue } from '@core/utils';
import { EbLoaderComponent } from '@shared/components/eb-loader/eb-loader.component';
import { ArchivesJournalService } from "@modules/job-log/archives-journal/service/archives-journal.service";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { BaseLogsComponent } from "@modules/job-log/abstract/base-logs";
import { JobLogArchivesConstants } from "@modules/job-log/archives-journal/archives-journal.constants";

@Component({
  standalone: true,
  selector: 'em-main-journal',
  templateUrl: './main-journal.component.html',
  styleUrls: ['./main-journal.component.scss'],
  providers: [JobLogService],
  imports: [
    TableComponent,
    EmHeaderComponent,
    EMPaginationComponent,
    EbLoaderComponent
  ]
})
export class MainJournalComponent extends BaseLogsComponent implements OnInit, AfterViewInit {
  tabMenuItems: ITab[] = MainJournalConstants.HEADER_TABS;
  params: Params = {};
  captionKey = 'main-journal-cols';

  private readonly route = inject(ActivatedRoute);
  private readonly jobLogService = inject(JobLogService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private filterParams: IFilterParams = {
    page: this.route.snapshot.queryParams['page'] || 1,
    sorts: '',
    pageSize: 15
  };

  override get columns() {
    return MainJournalConstants.JOB_LOG_COLUMNS;
  }

  ngOnInit(): void {
    this.initRouteParams();
  }

  ngAfterViewInit(): void {
    this.columns.map((x: any, i: any,) => ({
      key: x,
      index: i,
      isSelected: true
    } as ICaption));
    this.table().render(this.columns, this.jobLogData);
  }

  showDetail(jobLogId: string): void {
    this.router.navigate(['job-log/main-journal', jobLogId])
      .catch();
  }

  sortTable(value: string): void {
    this.filterParams.sorts = value;
    this.getJobLogs();
  }

  private getJobLogs(params: IFilterParams = this.filterParams): void {
    this.fetchLogs(this.jobLogService.getJobLogs.bind(this.jobLogService), params);
  }

  private initRouteParams(): void {
    this.route.queryParams
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res: Params) => {
        if (!isEmptyObject(res)) {
          this.filterParams = setDefaultFilterValue(res, this.captionKey);
          const params = parseFilterParams(res, this.filterParams, this.columns);
          this.getJobLogs(params);
        }
      });
  }
}
