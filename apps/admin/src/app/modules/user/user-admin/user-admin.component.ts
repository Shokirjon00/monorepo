import { AfterViewInit, Component, inject, OnInit, signal, viewChild } from '@angular/core';
import { DestroyableComponent } from '@eskhata/util';
import { ActionsComponent, EmHeaderComponent, EMPaginationComponent, TableComponent } from '@eskhata/ui';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { ICaption, IRowAction } from '@eskhata/util';
import { finalize, takeUntil } from 'rxjs';
import { UserAdminService } from '@modules/user/user-admin/services/user-admin.service';
import { IAction } from '@eskhata/util';
import { IFilterParams } from '@eskhata/util';
import { IPaginate } from '@eskhata/util';
import { IUserAdmin } from '@modules/user/user-admin/interfaces/user-admin.interface';
import { parseFilterParams } from '@core/utils/filter-util';
import { setDefaultFilterValue } from '@eskhata/util';
import { ITab } from '@eskhata/util';
import { BranchService } from "@modules/directory/branch/services/branch.service";
import { EbLoaderComponent } from "@shared/components/eb-loader/eb-loader.component";
import { UserAdminConstants } from "@modules/user/user-admin/user-admin.constants";

@Component({
  standalone: true,
  selector: 'em-user-admin',
  templateUrl: './user-admin.component.html',
  styleUrls: ['./user-admin.component.scss'],
  providers: [UserAdminService, BranchService],
  imports: [TableComponent, EmHeaderComponent, EMPaginationComponent, EbLoaderComponent, ActionsComponent]
})
export class UserAdminComponent extends DestroyableComponent implements OnInit, AfterViewInit {
  readonly table = viewChild(TableComponent);
  userData: IUserAdmin[];
  loading = signal(false);
  columns: any = UserAdminConstants.USER_ADMIN_COLUMNS;
  tableActions: IRowAction[] = UserAdminConstants.TABLE_ACTIONS;
  tabMenuItems: ITab[] = UserAdminConstants.HEADER_TABS;
  actions: IAction[] = UserAdminConstants.USER_ADMIN_ACTIONS;
  captionKey = 'user-admin'
  paginate: IPaginate | any;
  params: Params = {};

  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(UserAdminService);
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
    this.router.navigate([`user/admin/detail/${adminUserId}/info`])
      .catch()
  }

  edit(adminUserId: string): void {
    this.router.navigate([`user/admin/detail/${adminUserId}/edit`])
      .catch()
  }

  sortTable(value: string): void {
    this.queryParams.sorts = value;
    this.getAdminUsers()
  }

  private getAdminUsers(params = this.queryParams): void {
    this.loading.set(true);
    this.service.getAdminUsers(params)
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
