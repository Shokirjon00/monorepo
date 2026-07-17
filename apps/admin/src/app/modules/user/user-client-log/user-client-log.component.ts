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
import { IUserLog } from '@core/interfaces/user-log.interface';
import { UserClientLogService } from '@modules/user/user-client-log/services/user-client-log.service';
import { IAction } from "@shared/components/actions/actions.interface";
import { ActionsComponent } from "@shared/components/actions/actions.component";
import { EMPaginationComponent } from "@shared/components/em-pagination/pagination.component";
import { EbLoaderComponent } from "@shared/components/eb-loader/eb-loader.component";
import { EmHeaderComponent } from "@shared/components/em-header/em-header.component";
import { ITab } from "@core/interfaces/header.interface";
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
