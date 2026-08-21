import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DestroyableComponent } from '@eskhata/util';
import { finalize, takeUntil } from 'rxjs/operators';
import { IHeader } from '@eskhata/util';
import { ClientHistoryService } from "@modules/user/client-history/services/client-history.service";
import { IHistory } from "@modules/user/client-history/interfaces/client-history.interface";
import { EmHeaderComponent, ToastComponent } from '@eskhata/ui';
import { CommonModule } from "@angular/common";
import { DateTimePipe } from '@eskhata/util';
import { ReactiveFormsModule } from "@angular/forms";
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
