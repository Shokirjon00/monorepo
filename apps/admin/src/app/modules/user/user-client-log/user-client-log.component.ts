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
import { IUserLog } from '@core/interfaces/user-log.interface';
import { UserClientLogService } from '@modules/user/user-client-log/services/user-client-log.service';
import { IAction } from '@eskhata/util';
import { EbLoaderComponent } from "@shared/components/eb-loader/eb-loader.component";
import { ITab } from '@eskhata/util';
import { UserClientLogConstants } from "@modules/user/user-client-log/user-client-log.constants";

@Component({
  standalone: true,
  selector: 'em-user-client-log',
  templateUrl: './user-client-log.component.html',
  imports: [TableComponent, ActionsComponent, EMPaginationComponent, EbLoaderComponent, EmHeaderComponent],
  providers: [UserClientLogService]
})
export class UserClientLogComponent extends DestroyableComponent implements OnInit, AfterViewInit {
  readonly table = viewChild(TableComponent);
  userLogData: IUserLog[];
  loading = signal(false);
  captionKey = 'user-admin-log'
  columns: any = UserClientLogConstants.USER_CLIENT_LOG_COLUMNS;
  tabMenuItems: ITab[] = UserClientLogConstants.HEADER_TABS;
  paginate: IPaginate | any;
  params: Params = {};
  actions: IAction[] = [{}];

  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(UserClientLogService);
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
        this.getClientUsersLog(params);
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
    this.table().render(this.columns, this.userLogData)
  }

  sortTable(value: string): void {
    this.queryParams.sorts = value;
    this.getClientUsersLog()
  }


  private getClientUsersLog(params = this.queryParams): void {
    this.loading.set(true);
    this.service.getAdminUsersActivities(params)
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntil(this.destroyed$)
      )
      .subscribe(res => {
        if (res.status) {
          this.userLogData = res.data;
          this.paginate = res.meta.pagination;
        }
      })
  }

}
