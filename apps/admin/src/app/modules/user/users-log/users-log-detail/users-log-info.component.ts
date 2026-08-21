import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DestroyableComponent } from '@eskhata/util';
import { finalize, takeUntil } from 'rxjs/operators';
import { IHeader } from '@eskhata/util';
import { EmHeaderComponent, ToastComponent } from '@eskhata/ui';
import { CommonModule } from "@angular/common";
import { DateTimePipe } from '@eskhata/util';
import { UsersActivitiesService } from "@modules/user/users-log/services/users-activities.service";
import { IUsersActivities } from "@modules/user/users-log/interfaces/users-log.interface";

@Component({
  standalone: true,
  selector: 'em-client-history-info',
  templateUrl: './users-log-info.component.html',
  styleUrls: ['./users-log-info.component.scss'],
  providers: [UsersActivitiesService],
  imports: [
    ToastComponent,
    CommonModule,
    DateTimePipe,
    EmHeaderComponent
  ]
})
export class UsersLogInfoComponent extends DestroyableComponent implements OnInit {
  userDetail: IUsersActivities;
  loading: boolean;
  private activatedRoute = inject(ActivatedRoute);
  private adminService = inject(UsersActivitiesService);
  private adminUserId = this.activatedRoute.snapshot.parent.params['adminUserId'];

  ngOnInit(): void {
    this.getAdminUser();
  }

  private getAdminUser(): void {
    this.loading = true;
    this.adminService.getActivitiesDetail(this.adminUserId)
      .pipe(
        finalize(() => this.loading = false),
        takeUntil(this.destroyed$)
      )
      .subscribe(res => {
        this.userDetail = res.data
      })
  }

}
