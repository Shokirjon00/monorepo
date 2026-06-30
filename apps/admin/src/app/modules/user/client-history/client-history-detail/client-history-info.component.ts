import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DestroyableComponent } from '@core/abstract/destroyable.component';
import { finalize, takeUntil } from 'rxjs/operators';
import { IHeader } from '@core/interfaces/header.interface';
import { ClientHistoryService } from "@modules/user/client-history/services/client-history.service";
import { IHistory } from "@modules/user/client-history/interfaces/client-history.interface";
import { ToastComponent } from "@shared/components/toast/toast.component";
import { CommonModule } from "@angular/common";
import { DateTimePipe } from "@core/pipe/date-time.pipe";
import { ReactiveFormsModule } from "@angular/forms";
import { EmHeaderComponent } from "@shared/components/em-header/em-header.component";
import { NgxPermissionsModule } from "ngx-permissions";

@Component({
  standalone: true,
  selector: 'em-client-history-info',
  templateUrl: './client-history-info.component.html',
  styleUrls: ['./client-history-info.component.scss'],
  providers: [ClientHistoryService],
  imports: [
    ToastComponent,
    CommonModule,
    DateTimePipe,
    ReactiveFormsModule,
    EmHeaderComponent,
    NgxPermissionsModule,
    ]
})
export class ClientHistoryInfoComponent extends DestroyableComponent implements OnInit {
  userDetail: IHistory;
  loading: boolean;

  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly adminService = inject(ClientHistoryService);
  private adminUserId = this.activatedRoute.snapshot.parent.params['adminUserId'];

  ngOnInit(): void {
    this.getAdminUser();
  }


  private getAdminUser(): void {
    this.loading = true;
    this.adminService.getHistoryDetail(this.adminUserId)
      .pipe(
        finalize(() => this.loading = false),
        takeUntil(this.destroyed$)
      )
      .subscribe(res => this.userDetail = res.data)
  }

}
