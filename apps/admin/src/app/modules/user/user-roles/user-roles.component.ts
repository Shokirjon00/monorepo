import { AfterViewInit, Component, inject, OnInit, signal, viewChild } from '@angular/core';
import { TableComponent } from '@shared/components/table/table.component';
import { DestroyableComponent } from '@core/abstract/destroyable.component';
import { ICaption, IRowAction } from '@core/interfaces/table.interface';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { finalize, takeUntil } from 'rxjs';
import { ClientUsersService } from '@modules/user/user-client/services/client-users.service';
import { ITab } from '@core/interfaces/header.interface';
import { IFilterParams } from '@core/interfaces/filter-params.interface';
import { IPaginate } from '@core/interfaces/paginate.interface';
import { parseFilterParams } from '@core/utils/filter-util';
import { setDefaultFilterValue } from '@core/utils/route-param-parse';
import { UsersRolesService } from "@modules/user/user-roles/services/users-roles.service";
import { IUsersRoles } from "@modules/user/user-roles/interfaces/users-roles.interface";
import { IAction } from "@shared/components/actions/actions.interface";
import { ActionsComponent } from "@shared/components/actions/actions.component";
import { EMPaginationComponent } from "@shared/components/em-pagination/pagination.component";
import { EbLoaderComponent } from "@shared/components/eb-loader/eb-loader.component";
import { EmHeaderComponent } from "@shared/components/em-header/em-header.component";
import { UserRolesConstants } from "@modules/user/user-roles/user-roles.constants";

@Component({
  standalone: true,
  selector: 'em-user-roles',
  templateUrl: './user-roles.component.html',
  styleUrls: ['./user-roles.component.scss'],
  imports: [TableComponent, ActionsComponent, EMPaginationComponent, EbLoaderComponent, EmHeaderComponent],
  providers: [UsersRolesService, ClientUsersService]
})
export class UserRolesComponent extends DestroyableComponent implements OnInit, AfterViewInit {
  readonly table = viewChild(TableComponent);
  userData: IUsersRoles[];
  loading = signal(false);
  columns: any = UserRolesConstants.USER_ROLES_COLUMNS;
  tableActions: IRowAction[] = UserRolesConstants.TABLE_ACTIONS;
  tabMenuItems: ITab[] = UserRolesConstants.HEADER_TABS;
  actions: IAction[] = UserRolesConstants.USER_ROLES_ACTIONS;
  captionKey = 'user-roles'
  params: Params = {};
  paginate: IPaginate | any;

  private readonly router = inject(Router);
  private readonly clientService = inject(UsersRolesService);
  private readonly route = inject(ActivatedRoute);
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
        this.getUsersRoles(params);
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
    this.table().render(this.columns, this.userData)
  }

  showDetail(clientUserId: string): void {
    this.router.navigate([`user/client-roles/detail/${clientUserId}/info`])
      .catch()
  }

  edit(clientUserId: string): void {
    this.router.navigate([`user/client-roles/detail/${clientUserId}/edit`])
      .catch()
  }

  link(dataDetail: { dataSourceId: string, fieldName: string }): void {
    if (dataDetail.fieldName === 'companyName') {
      const companyId = this.userData.find(item => item.id === dataDetail.dataSourceId).companyId;
      this.router.navigate(['clients/company', companyId]).catch();
    }
  }

  sortTable(value: string): void {
    this.queryParams.sorts = value;
    this.getUsersRoles()
  }

  private getUsersRoles(params = this.queryParams): void {
    this.loading.set(true);
    this.clientService.getUsersRoles(params)
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
