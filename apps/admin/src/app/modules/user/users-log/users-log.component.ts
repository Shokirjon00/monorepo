import { AfterViewInit, Component, inject, OnInit, signal, viewChild } from '@angular/core';
import { DestroyableComponent } from '@core/abstract/destroyable.component';
import { TableComponent } from '@shared/components/table/table.component';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { ICaption } from '@core/interfaces/table.interface';
import { finalize, takeUntil } from 'rxjs';
import { IFilterParams } from '@core/interfaces/filter-params.interface';
import { IPaginate } from '@eskhata/util';
import { parseFilterParams } from '@core/utils/filter-util';
import { setDefaultFilterValue } from '@core/utils/route-param-parse';
import { ITab } from "@core/interfaces/header.interface";
import { UsersActivitiesService } from "@modules/user/users-log/services/users-activities.service";
import { IUsersActivities } from "@modules/user/users-log/interfaces/users-log.interface";
import { IAction } from "@shared/components/actions/actions.interface";
import { ActionsComponent } from "@shared/components/actions/actions.component";
import { EMPaginationComponent } from "@shared/components/em-pagination/pagination.component";
import { EbLoaderComponent } from "@shared/components/eb-loader/eb-loader.component";
import { EmHeaderComponent } from "@shared/components/em-header/em-header.component";
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
