import { AfterViewInit, Component, inject, OnInit, signal, viewChild } from '@angular/core';
import { DestroyableComponent } from '@eskhata/util';
import { ActionsComponent, EmHeaderComponent, EMPaginationComponent, TableComponent } from '@eskhata/ui';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { ICaption } from '@eskhata/util';
import { finalize, takeUntil } from 'rxjs';
import { IFilterParams } from '@eskhata/util';
import { IPaginate } from '@eskhata/util';
import { parseFilterParams } from '@core/utils/filter-util';
import { setDefaultFilterValue } from '@eskhata/util';
import { ITab } from '@eskhata/util';
import { UsersActivitiesService } from "@modules/user/users-log/services/users-activities.service";
import { IUsersActivities } from "@modules/user/users-log/interfaces/users-log.interface";
import { IAction } from '@eskhata/util';
import { EbLoaderComponent } from "@shared/components/eb-loader/eb-loader.component";
import { UserLogConstantsConstants } from "@modules/user/users-log/user-log.constants";

@Component({
  standalone: true,
  selector: 'em-client-history',
  templateUrl: './users-log.component.html',
  styleUrls: ['./users-log.component.scss'],
  imports: [TableComponent, ActionsComponent, EMPaginationComponent, EbLoaderComponent, EmHeaderComponent],
  providers: [UsersActivitiesService]
})
export class UsersLogComponent extends DestroyableComponent implements OnInit, AfterViewInit {
  readonly table = viewChild(TableComponent);
  userData: IUsersActivities[];
  loading = signal(false);
  captionKey = 'history-update'
  columns: any = UserLogConstantsConstants.USERS_LOG_COLUMNS;
  tabMenuItems: ITab[] = UserLogConstantsConstants.HEADER_TABS;
  actions: IAction[] = UserLogConstantsConstants.USER_CLIENT_ACTIONS;
  paginate: IPaginate | any;
  params: Params = {};

  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(UsersActivitiesService);
  private queryParams: IFilterParams = {
    filters: '',
    page: this.route.snapshot.queryParams['Page'] || 1,
    sorts: '',
    pageSize: 15
  };


  ngOnInit(): void {
    this.route.queryParams
      .pipe(takeUntil(this.destroyed$))
      .subscribe((res: Params) => {
        this.params = res;
        this.queryParams = setDefaultFilterValue(res, this.captionKey);
        const params = parseFilterParams(res, this.queryParams, this.columns);
        this.getUsersActivities(params);
        this.router.navigate([],
          {
            relativeTo: this.route,
            queryParams: this.params
          }).catch();
      });
  }


  ngAfterViewInit(): void {
    this.columns.map((x: any, i: any,) => ({
      key: x,
      index: i,
      isSelected: true
    } as ICaption));
    this.table().render(this.columns, this.userData)
  }

  showDetail(adminUserId: string): void {
    this.router.navigate([`user/users-log/detail/${adminUserId}/info`])
      .catch()
  }


  sortTable(value: string): void {
    this.queryParams.sorts = value;
    this.getUsersActivities();
  }

  private getUsersActivities(params = this.queryParams): void {
    this.loading.set(true);
    this.service.getUsersActivities(params)
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntil(this.destroyed$)
      )
      .subscribe(res => {
        if (res.status) {
          this.userData = res.data;
          this.paginate = res.meta.pagination;
        }
      })
  }
}
