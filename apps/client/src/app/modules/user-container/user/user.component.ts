import { AfterViewInit, Component, inject, OnInit, signal, viewChild } from '@angular/core';
import { IRowAction } from '@core/interfaces/table.interface';
import { TableComponent } from '@shared/components/table/table.component';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { finalize, takeUntil } from 'rxjs';
import { DestroyableComponent } from '@core/directives/destroyable.component';
import { IPaginate } from '@core/interfaces/paginate.interface';
import { IAction } from '@shared/components/actions/action.interface';
import { ITab } from '@core/interfaces/header.interface';
import { IFilterParams } from '@core/interfaces/filter-params.interface';
import { parseFilterParams } from '@core/utils/filter-util';
import { isPhone } from '@core/helper';
import { NgxPermissionsModule, NgxPermissionsService } from 'ngx-permissions';
import { SharedModule } from '@shared/shared.module';
import { EskhataBankLoaderComponent } from '@shared/components/eskhata-bank-loader/eskhata-bank-loader.component';

import { UsersService } from '@modules/user-container/user/services/users.service';
import { IUsers } from '@modules/user-container/user/interfaces/users.interface';
import { UserConstants } from '@modules/user-container/user/user.constants';
import { EmHeaderComponent } from '@shared/components/em-header/em-header.component';
import { ActionsComponent } from '@shared/components/actions/actions.component';
import { ICaption } from '@core/interfaces/table1.interface';
import { EMPaginationComponent } from '@shared/components/em-pagination/pagination.component';
import { restoreQueryParamsIfEmpty } from '@core/utils/restore-query-params';

@Component({
  standalone: true,
  selector: 'em-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss'],
  imports: [
    SharedModule,
    EskhataBankLoaderComponent,
    EMPaginationComponent,
    TableComponent,
    NgxPermissionsModule,
    EmHeaderComponent,
    ActionsComponent,
  ],
})
export class UserComponent extends DestroyableComponent implements OnInit, AfterViewInit {
  readonly table = viewChild(TableComponent);
  userData: IUsers[];
  loading = signal(false);
  columns: ICaption[] = UserConstants.USER_COLUMNS;
  tableActions: IRowAction[] = UserConstants.TABLE_ACTIONS;
  actions: IAction[] = UserConstants.ACTIONS;
  tabMenuItems: ITab[] = UserConstants.HEADER_TABS;
  captionKey = 'usersFiltersForm';
  params: Params = {};
  paginate: IPaginate | any;
  showScrollButton: boolean = false;
  readonly isMobile = isPhone();

  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly userService = inject(UsersService);
  private readonly permissionService = inject(NgxPermissionsService);

  private queryParams: IFilterParams = {
    filters: '',
    page: this.route.snapshot.queryParams['Page'] || 1,
    sorts: '',
    pageSize: 15,
  };

  ngOnInit(): void {
    this.route.queryParams.pipe(takeUntil(this.destroyed$)).subscribe(res => {
      restoreQueryParamsIfEmpty(this.captionKey, this.route, this.router);
      this.params = res;
      this.queryParams.page = res['page'];
      this.queryParams.pageSize = res['pageSize'];
      const params = parseFilterParams(res, this.queryParams, this.columns);
      if (this.params['module'] && this.captionKey !== this.params['module']) {
        this.queryParams.page = 1;
      } else {
        this.queryParams.module = this.captionKey;
      }
      this.getUsers(params);
    });
  }

  ngAfterViewInit(): void {
    this.columns.map(
      (x: any, i: any) =>
        ({
          key: x,
          index: i,
          isSelected: true,
        }) as ICaption
    );
    this.table().render(this.columns, this.userData);
  }

  showDetail(id: string): void {
    if (!this.permissionService.getPermission('UserDetail')) return;
    this.router.navigate(['user/user/detail', id, 'info']).catch();
  }

  edit(id: string): void {
    this.router.navigate(['user/user/detail', id, 'edit']).catch();
  }

  sortTable(value: string): void {
    this.queryParams.sorts = value;
    this.getUsers();
  }

  private getUsers(params = this.queryParams): void {
    this.loading.set(true);
    this.userService
      .getUsers(params)
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntil(this.destroyed$)
      )
      .subscribe(res => {
        if (res.status) {
          this.userData = res.data;
          this.paginate = res.meta.pagination;
        }
      });
  }
}
