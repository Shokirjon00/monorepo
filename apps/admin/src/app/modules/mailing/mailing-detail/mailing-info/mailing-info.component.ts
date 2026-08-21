import { Component, inject, OnInit } from '@angular/core';
import { takeUntil } from 'rxjs';
import { DestroyableComponent } from '@eskhata/util';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MailingService } from '@modules/mailing/services/mailing.service';
import { IMailing } from '@modules/mailing/interfaces/mailing.interface';
import { NgxPermissionsModule } from "ngx-permissions";
import { IAction } from '@eskhata/util';
import { MailingInfoConstants } from "@modules/mailing/mailing-detail/mailing-info/mailing-info.constants";
import { ActionsComponent, EmHeaderComponent } from '@eskhata/ui';
import { DateTimePipe } from '@eskhata/util';

@Component({
  standalone: true,
  selector: 'em-mailing-info',
  templateUrl: './mailing-info.component.html',
  styleUrls: ['./mailing-info.component.scss'],
  providers: [MailingService],
  imports: [
    NgxPermissionsModule,
    CommonModule,
    EmHeaderComponent,
    ActionsComponent,
    DateTimePipe
  ]
})
export class MailingInfoComponent extends DestroyableComponent implements OnInit {
  mailingDetail: IMailing;

  private readonly service = inject(MailingService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private mailingId = this.activatedRoute.snapshot.parent.params['mailingId'];
  actions: IAction[] = MailingInfoConstants.getActions(this.mailingId);

  ngOnInit(): void {
    this.getDetail()
  }

  private getDetail(): void {
    this.service.getMailingDetailById(this.mailingId)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => {
        this.mailingDetail = res.data;
      })
  }
}
