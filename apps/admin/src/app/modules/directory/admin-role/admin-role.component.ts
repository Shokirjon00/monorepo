import { AfterViewInit, Component, inject, OnInit, viewChild } from '@angular/core';
import { DestroyableComponent } from '@eskhata/util';
import { ActionsComponent, EmHeaderComponent, EMPaginationComponent, TableComponent } from '@eskhata/ui';
import { ICaption, IRowAction } from '@eskhata/util';
import { IAction } from '@eskhata/util';
import { ITab } from '@eskhata/util';
import { IPaginate } from '@eskhata/util';
import { IFilterParams } from '@eskhata/util';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { finalize, takeUntil } from 'rxjs';
import { parseFilterParams } from '@core/utils/filter-util';
import { AdminRoleService } from '@modules/directory/admin-role/services/admin-role.service';
import { IAdminRole } from '@modules/directory/admin-role/interfaces/admin-role.interface';
import { setDefaultFilterValue } from '@eskhata/util';
import { AdminRoleConstants } from "@modules/directory/admin-role/admin-role.constants";
import { DirectoryConstants } from "@modules/directory/directory.constants";

@Component({
  standalone: true,
  selector: 'em-admin-role',
  templateUrl: './admin-role.component.html',
  styleUrls: ['./admin-role.component.scss'],
  providers: [AdminRoleService],
  imports: [TableComponent, ActionsComponent, EMPaginationComponent, EmHeaderComponent]
})
export class AdminRoleComponent extends DestroyableComponent implements OnInit, AfterViewInit {
  readonly table = viewChild(TableComponent);
  loading: boolean;
  adminRoles: IAdminRole[];
  actions: IAction[] = AdminRoleConstants.ADMIN_ROLE_ACTIONS
  columns = AdminRoleConstants.ADMINROLE_COLUMNS
  tableActions: IRowAction[] = AdminRoleConstants.TABLE_ACTIONS
  tabMenuItems: ITab[] = DirectoryConstants.HEADER_TABS
  captionKey = 'admin-role';
  paginate: IPaginate;

  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(AdminRoleService);

  filterParams: IFilterParams = {
    page: this.route.snapshot.queryParams['Page'] || 1,
    sorts: '',
    pageSize: 15
  };
  params: Params = {};

  ngOnInit(): void {
    this.route.queryParams
      .pipe(takeUntil(this.destroyed$))
      .subscribe((res: Params) => {
        this.params = res;
        this.filterParams = setDefaultFilterValue(res, this.captionKey);
        const params = parseFilterParams(res, this.filterParams, this.columns);
        this.getAdminRoles(params);
        this.router.navigate([],
          {
            relativeTo: this.route,
            queryParams: this.params
          }).catch();
      })
  }

  ngAfterViewInit(): void {
    this.columns.map((x: any, i: any,) => ({
      key: x,
      index: i,
      isSelected: true
    } as ICaption));
    this.table().render(this.columns, this.adminRoles);
  }

  detail(adminRoleId: string): void {
    this.router.navigate(['directory/admin-roles/detail', adminRoleId, 'info']).catch();
  }

  edit(adminRoleId: string): void {
    this.router.navigate(['directory/admin-roles/detail', adminRoleId, 'edit']).catch();
  }

  sortTable(value: string): void {
    this.filterParams.sorts = value;
    this.getAdminRoles();
  }

  private getAdminRoles(params = this.filterParams): void {
    this.loading = true;
    this.service.getAdminRoles(params)
      .pipe(
        finalize(() => this.loading = false),
        takeUntil(this.destroyed$)
      )
      .subscribe(res => {
        this.adminRoles = res.data;
        this.paginate = res.meta.pagination;
      })
  }
}
