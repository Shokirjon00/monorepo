import { AfterViewInit, Component, inject, OnInit, signal, viewChild } from '@angular/core';
import { DestroyableComponent } from '@core/abstract/destroyable.component';
import { TableComponent } from '@shared/components/table/table.component';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { ICaption } from '@core/interfaces/table.interface';
import { finalize, takeUntil } from 'rxjs';
import { IFilterParams } from '@core/interfaces/filter-params.interface';
import { IPaginate } from '@core/interfaces/paginate.interface';
import { parseFilterParams } from '@core/utils/filter-util';
import { setDefaultFilterValue } from '@core/utils/route-param-parse';
import { UsersHistoryService } from "@modules/user/users-history/services/users-history.service";
import { IHeader, ITab } from "@core/interfaces/header.interface";
import { IHistoryUsers } from "@modules/user/users-history/interfaces/users-history.interface";
import { IAction } from "@shared/components/actions/actions.interface";
import { ActionsComponent } from "@shared/components/actions/actions.component";
import { EMPaginationComponent } from "@shared/components/em-pagination/pagination.component";
import { EbLoaderComponent } from "@shared/components/eb-loader/eb-loader.component";
import { EmHeaderComponent } from "@shared/components/em-header/em-header.component";
import { UserHistoryConstants } from "@modules/user/users-history/user-history.constants";
import { PaginationComponent } from "@shared/components/pagination/pagination.component";

@Component({
  standalone: true,
  selector: 'em-client-history',
  templateUrl: './users-history.component.html',
  styleUrls: ['./users-history.component.scss'],
  imports: [TableComponent, ActionsComponent, EMPaginationComponent, EbLoaderComponent, EmHeaderComponent],
  providers: [UsersHistoryService]
})
export class UsersHistoryComponent extends DestroyableComponent implements OnInit, AfterViewInit {
  readonly table = viewChild(TableComponent);
  userData: IHistoryUsers[];
  loading = signal(false);
  captionKey = 'history-update'
  headerData: IHeader = {
    isFilter: true,
    tabShow: true
  };
  columns: any = UserHistoryConstants.USER_HISTORY_COLUMNS;
  tabMenuItems: ITab[] = UserHistoryConstants.HEADER_TABS;
  actions: IAction[] = UserHistoryConstants.USER_ADMIN_ACTIONS;
  paginate: IPaginate | any;
  params: Params = {};

  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private service = inject(UsersHistoryService);
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
        this.getAdminUsers(params);
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
    this.router.navigate([`user/users-history-update/detail/${adminUserId}/info`])
      .catch()
  }


  sortTable(value: string): void {
    this.queryParams.sorts = value;
    this.getAdminUsers();
  }

  private getAdminUsers(params = this.queryParams): void {
    this.loading.set(true);
    this.service.getHistory(params)
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
