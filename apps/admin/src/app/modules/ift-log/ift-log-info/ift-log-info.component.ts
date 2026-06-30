import { Component, inject, OnInit } from '@angular/core';
import {takeUntil} from 'rxjs';
import {DestroyableComponent} from '@core/abstract/destroyable.component';
import {ActivatedRoute} from '@angular/router';
import {IIftLog} from '../interfaces/ift-log.interface';
import {BreadcrumbService} from 'xng-breadcrumb';
import {DateTimePipe} from '@core/pipe/date-time.pipe';
import {IftLogService} from '@modules/ift-log/services/ift-log.service';
import { EmHeaderComponent } from "@shared/components/em-header/em-header.component";
import { NgxPermissionsModule } from "ngx-permissions";

@Component({
  standalone: true,
  selector: 'em-ift-log-info',
  templateUrl: './ift-log-info.component.html',
  styleUrls: ['./ift-log-info.component.scss'],
  imports: [
    DateTimePipe,
    EmHeaderComponent,
    NgxPermissionsModule
  ],
  providers: [IftLogService]
})
export class IftLogInfoComponent extends DestroyableComponent implements OnInit {
  iftLogInfo: IIftLog;
  private readonly service = inject(IftLogService);
  private readonly route = inject(ActivatedRoute);
  private readonly breadcrumbService = inject(BreadcrumbService);
  iftLogId = this.route.snapshot.params['iftLogId'];

  ngOnInit(): void {
    this.getJobLogInfo();
  }


  private getJobLogInfo(): void {
    this.breadcrumbService.set('@iftLogDetail', {skip: true});
    this.service.getIftLogDetail(this.iftLogId)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => {
        this.iftLogInfo = res.data
        this.breadcrumbService.set('@iftLogDetail', {label: this.iftLogInfo.messageName, skip: false});
      })
  }

}
