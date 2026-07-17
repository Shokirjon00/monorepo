import { AfterViewInit, Component, DestroyRef, inject, OnInit } from '@angular/core';
import { IFilterParams } from '@core/interfaces/filter-params.interface';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { ICaption } from '@core/interfaces/table.interface';
import { parseFilterParams } from '@core/utils/filter-util';
import { TableComponent } from '@shared/components/table/table.component';
import { ITab } from '@core/interfaces/header.interface';
import { JobLogArchivesConstants } from "@modules/job-log/archives-journal/archives-journal.constants";
import { ArchivesJournalService } from "@modules/job-log/archives-journal/service/archives-journal.service";
import { EMPaginationComponent } from "@shared/components/em-pagination/pagination.component";
import { EmHeaderComponent } from "@shared/components/em-header/em-header.component";

import { isEmptyObject, setDefaultFilterValue } from "@core/utils";
import { EbLoaderComponent } from "@shared/components/eb-loader/eb-loader.component";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { BaseLogsComponent } from "@modules/job-log/abstract/base-logs";

@Component({
  standalone: true,
  selector: 'em-archives-journal',
  templateUrl: './archives-journal.component.html',
  styleUrls: ['./archives-journal.component.scss'],
  providers: [ArchivesJournalService],
  imports: [
    TableComponent,
    EMPaginationComponent,
    EmHeaderComponent,
    EbLoaderComponent
  ]
})

export class ArchivesJournalComponent extends BaseLogsComponent implements OnInit, AfterViewInit {
  tabMenuItems: ITab[] = JobLogArchivesConstants.HEADER_TABS;
  captionKey = 'archives-journal-cols';
  params: Params = {};

  private route = inject(ActivatedRoute);
  private service = inject(ArchivesJournalService);
  private router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private filterParams: IFilterParams = {
    page: this.route.snapshot.queryParams['page'] || 1,
    pageSize: 15
  };

  override get columns() {
    return JobLogArchivesConstants.ARCHIVES_JOURNAL_COLUMNS;
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
    this.router.navigate(['job-log/archives-journal', jobLogId]).catch();
  }

  sortTable(value: string): void {
    this.filterParams.sorts = value;
    this.getArchiveJournal();
  }

  private getArchiveJournal(params: IFilterParams = this.filterParams): void {
    this.fetchLogs(this.service.getJobLogsDWH.bind(this.service), params);
  }

  private initRouteParams(): void {
    this.route.queryParams
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res: Params) => {
        if (!isEmptyObject(res)) {
          this.filterParams = setDefaultFilterValue(res, this.captionKey);
          const params = parseFilterParams(res, this.filterParams, this.columns);
          this.getArchiveJournal(params);
        }
      });
  }
}
