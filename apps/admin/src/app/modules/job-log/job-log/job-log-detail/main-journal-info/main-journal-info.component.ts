import { Component, inject, OnInit } from '@angular/core';
import { takeUntil } from 'rxjs';
import { DestroyableComponent } from '@core/abstract/destroyable.component';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { IJobLogInfo } from '@modules/job-log/interfaces/job-log.interface';
import { BreadcrumbService } from 'xng-breadcrumb';
import { DateTimePipe } from "@core/pipe/date-time.pipe";
import { CommonModule } from "@angular/common";
import { IHeader } from "@core/interfaces/header.interface";
import { HeaderService } from "@core/services/header.service";
import { JobLogService } from "@modules/job-log/services/job-log.service";
import { EmHeaderComponent } from "@shared/components/em-header/em-header.component";

@Component({
  standalone: true,
  selector: 'em-main-journal-info',
  templateUrl: './main-journal-info.component.html',
  styleUrls: ['./main-journal-info.component.scss'],
  providers: [JobLogService],
    imports: [
        CommonModule,
        DateTimePipe,
        EmHeaderComponent
    ]
})
export class MainJournalInfoComponent extends DestroyableComponent implements OnInit {
  jobLogInfo: IJobLogInfo;

  private readonly jobLogService = inject(JobLogService);
  private readonly route = inject(ActivatedRoute);
  private readonly breadcrumbService = inject(BreadcrumbService);
  private readonly router = inject(Router);

  jobLogId = this.route.snapshot.parent.params['jobLogId'];
  params: Params = {};

  ngOnInit(): void {
    this.getJobLogInfo();
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: this.params,
      queryParamsHandling: 'merge'
    }).catch();
  }

  private getJobLogInfo(): void {
    this.breadcrumbService.set('@jobLogDetail', {skip: true});
    this.jobLogService.getDetail(this.jobLogId)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => {
        this.jobLogInfo = res.data;
        this.breadcrumbService.set('@jobLogDetail', {label: this.jobLogInfo?.jobLogTypeName, skip: false});
      });
  }

}
