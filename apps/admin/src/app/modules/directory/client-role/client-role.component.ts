import { AfterViewInit, Component, inject, OnInit, viewChild } from '@angular/core';
import { DestroyableComponent } from '@eskhata/util';
import { ActionsComponent, EmHeaderComponent, EMPaginationComponent, TableComponent } from '@eskhata/ui';
import { IClientRole } from '@modules/directory/client-role/interfaces/client-role.interface';
import { ICaption, IRowAction } from '@eskhata/util';
import { IAction } from '@eskhata/util';
import { ITab } from '@eskhata/util';
import { IPaginate } from '@eskhata/util';
import { IFilterParams } from '@eskhata/util';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { ClientRoleService } from '@modules/directory/client-role/services/client-role.service';
import { finalize, takeUntil } from 'rxjs';
import { parseFilterParams } from '@core/utils/filter-util';
import { setDefaultFilterValue } from '@eskhata/util';
import { DirectoryConstants } from "@modules/directory/directory.constants";
import { ClientRoleConstants } from "@modules/directory/client-role/client.role.constants";

@Component({
  standalone: true,
  selector: 'em-client-role',
  templateUrl: './client-role.component.html',
  styleUrls: ['./client-role.component.scss'],
  providers: [ClientRoleService],
  imports: [TableComponent, ActionsComponent, EMPaginationComponent, EmHeaderComponent]
})
export class ClientRoleComponent extends DestroyableComponent implements OnInit, AfterViewInit {
  readonly table = viewChild(TableComponent);
  loading: boolean;
  clientRoles: IClientRole[];
  columns = ClientRoleConstants.CLIENTROLE_COLUMNS
  tabMenuItems: ITab[] = DirectoryConstants.HEADER_TABS
  tableActions: IRowAction[] = ClientRoleConstants.TABLE_ACTIONS;
  captionKey = 'client-role';
  actions: IAction[] = ClientRoleConstants.CLIENT_ROLE_ACTIONS
  paginate: IPaginate;

  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(ClientRoleService);

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
    this.table().render(this.columns, this.clientRoles)
  }

  detail(clientRoleId: string): void {
    this.router.navigate(['directory/client-roles/info', clientRoleId])
      .catch()
  }

  edit(clientRoleId: string): void {
    this.router.navigate(['directory/client-roles/edit', clientRoleId])
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
        this.clientRoles = res.data;
        this.paginate = res.meta.pagination;
      })
  }
}
