import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DestroyableComponent } from '@eskhata/util';
import { finalize, takeUntil } from 'rxjs/operators';
import { IHistory } from "@modules/user/client-history/interfaces/client-history.interface";
import { EmHeaderComponent, ToastComponent } from '@eskhata/ui';
import { CommonModule } from "@angular/common";
import { DateTimePipe } from '@eskhata/util';
import { UsersHistoryService } from "@modules/user/users-history/services/users-history.service";
import { ReactiveFormsModule } from "@angular/forms";
import { NgxPermissionsModule } from "ngx-permissions";

@Component({
  standalone: true,
  selector: 'em-client-history-info',
  templateUrl: './users-history-info.component.html',
  styleUrls: ['./users-history-info.component.scss'],
  providers: [UsersHistoryService],
  imports: [
    ToastComponent,
    CommonModule,
    DateTimePipe,
    ReactiveFormsModule,
    EmHeaderComponent,
    NgxPermissionsModule,
    ]
})
export class UsersHistoryInfoComponent extends DestroyableComponent implements OnInit {
  userDetail: IHistory;
  loading: boolean;
  private readonly activatedRoute =  inject(ActivatedRoute);
  private readonly adminService = inject(UsersHistoryService);
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
