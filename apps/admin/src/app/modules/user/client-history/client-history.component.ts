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
import { IHistory } from "@modules/user/client-history/interfaces/client-history.interface";
import { ClientHistoryService } from "@modules/user/client-history/services/client-history.service";
import { IAction } from '@eskhata/util';
import { EbLoaderComponent } from "@shared/components/eb-loader/eb-loader.component";
import { ClientHistoryConstants } from "@modules/user/client-history/client-history.constants";

@Component({
  standalone: true,
  selector: 'em-client-history',
  templateUrl: './client-history.component.html',
  styleUrls: ['./client-history.component.scss'],
  imports: [TableComponent, ActionsComponent, EMPaginationComponent, EbLoaderComponent, EmHeaderComponent],
  providers: [ClientHistoryService]
})
export class ClientHistoryComponent extends DestroyableComponent implements OnInit, AfterViewInit {
  readonly table = viewChild(TableComponent);
  userData: IHistory[];
  loading = signal(false);
  captionKey = 'history-update'
  columns: any = ClientHistoryConstants.USER_CLIENT_HISTORY_COLUMNS;
  tabMenuItems: ITab[] = ClientHistoryConstants.HEADER_TABS;
  actions: IAction[] = ClientHistoryConstants.USER_CLIENT_ACTIONS;
  paginate: IPaginate | any;
  params: Params = {};

  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(ClientHistoryService);
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
    this.router.navigate([`user/history-update/detail/${adminUserId}/info`])
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
