import { AfterViewInit, Component, inject, OnInit, viewChild } from '@angular/core';
import { DestroyableComponent } from '@core/abstract/destroyable.component';
import { TableComponent } from '@shared/components/table/table.component';
import { ICaption, IRowAction } from '@core/interfaces/table.interface';
import { ITab } from '@core/interfaces/header.interface';
import { IPaginate } from '@eskhata/util';
import { IFilterParams } from '@core/interfaces/filter-params.interface';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { finalize, takeUntil } from 'rxjs';
import { parseFilterParams } from '@core/utils/filter-util';
import { setDefaultFilterValue } from '@core/utils/route-param-parse';
import { UsersRoleService } from "@modules/directory/user-role/services/users-role.service";
import { IUserRole } from "@modules/directory/user-role/interfaces/user-role.interface";
import { IAction } from "@shared/components/actions/actions.interface";
import { UserRoleConstants } from "@modules/directory/user-role/user.role.constants";
import { ActionsComponent } from "@shared/components/actions/actions.component";
import { EMPaginationComponent } from "@shared/components/em-pagination/pagination.component";
import { EmHeaderComponent } from "@shared/components/em-header/em-header.component";
import { DirectoryConstants } from "@modules/directory/directory.constants";

@Component({
  standalone: true,
  selector: 'em-client-role',
  templateUrl: './user-role.component.html',
  styleUrls: ['./user-role.component.scss'],
  imports: [TableComponent, ActionsComponent, EMPaginationComponent, EmHeaderComponent],
  providers: [UsersRoleService]
})
export class UserRoleComponent extends DestroyableComponent implements OnInit, AfterViewInit {
  readonly table = viewChild(TableComponent);
  loading: boolean;
  userRoles: IUserRole[];
  columns = UserRoleConstants.USER_ROLE_COLUMNS
  tableActions: IRowAction[] = UserRoleConstants.TABLE_ACTIONS
  captionKey = 'client-role';
  actions: IAction[] = UserRoleConstants.USER_ROLE_ACTIONS
  tabMenuItems: ITab[] = DirectoryConstants.HEADER_TABS
  paginate: IPaginate;

  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(UsersRoleService);

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
        this.getClientRoles(params);
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
    } as ICaption))
    this.table().render(this.columns, this.userRoles)
  }

  detail(clientRoleId: string): void {
    this.router.navigate(['directory/user-roles/info', clientRoleId])
      .catch()
  }

  edit(clientRoleId: string): void {
    this.router.navigate(['directory/user-roles/edit', clientRoleId])
      .catch()
  }


  sortTable(value: string): void {
    this.filterParams.sorts = value;
    this.getClientRoles()
  }

  private getClientRoles(params = this.filterParams): void {
    this.loading = true
    this.service.getClientRoles(params)
      .pipe(
        finalize(() => this.loading = false),
        takeUntil(this.destroyed$)
      )
      .subscribe(res => {
        this.userRoles = res.data;
        this.paginate = res.meta.pagination;
      })
  }
}
