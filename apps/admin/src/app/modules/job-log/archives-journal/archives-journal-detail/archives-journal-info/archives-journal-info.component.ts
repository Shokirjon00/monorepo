import { Component, inject, OnInit } from '@angular/core';
import { takeUntil } from 'rxjs';
import { DestroyableComponent } from '@core/abstract/destroyable.component';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { BreadcrumbService } from 'xng-breadcrumb';
import { DateTimePipe } from "@core/pipe/date-time.pipe";
import { CommonModule } from "@angular/common";
import { IJobLogInfo } from "@modules/job-log/interfaces/job-log.interface";
import { ArchivesJournalService } from "@modules/job-log/archives-journal/service/archives-journal.service";
import { EmHeaderComponent } from "@shared/components/em-header/em-header.component";
import { NgxPermissionsModule } from "ngx-permissions";

@Component({
  standalone: true,
  selector: 'em-archives-journal',
  templateUrl: './archives-journal-info.component.html',
  styleUrls: ['./archives-journal-info.component.scss'],
  providers: [ArchivesJournalService],
    imports: [
        CommonModule,
        DateTimePipe,
        EmHeaderComponent,
        NgxPermissionsModule,
        ]
})
export class ArchivesJournalInfoComponent extends DestroyableComponent implements OnInit {
  jobLogInfo: IJobLogInfo;
  params: Params = {};

  private readonly service = inject(ArchivesJournalService);
  private readonly route = inject(ActivatedRoute);
  private readonly breadcrumbService = inject(BreadcrumbService);
  private readonly router = inject(Router);

  jobLogId = this.route.snapshot.parent.params['jobLogId'];

  ngOnInit(): void {
    this.getArchiveJournalInfo();
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: this.params,
      queryParamsHandling: 'merge'
    }).catch();
  }

  private getArchiveJournalInfo(): void {
    this.breadcrumbService.set('@jobLogDetail', {skip: true});
    this.service.getDetail(this.jobLogId)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => {
        this.jobLogInfo = res.data;
        this.breadcrumbService.set('@jobLogDetail', {label: this.jobLogInfo?.jobLogTypeName, skip: false});
      });
  }
}
