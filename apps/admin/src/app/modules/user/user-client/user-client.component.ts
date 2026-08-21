import {AfterViewInit, Component, DestroyRef, inject, OnInit, signal, viewChild} from '@angular/core';
import { ActionsComponent, EmHeaderComponent, EMPaginationComponent, TableComponent } from '@eskhata/ui';
import { DestroyableComponent } from '@eskhata/util';
import { ICaption, IRowAction } from '@eskhata/util';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { finalize, takeUntil } from 'rxjs';
import { ClientUsersService } from '@modules/user/user-client/services/client-users.service';
import { IAction } from '@eskhata/util';
import { ITab } from '@eskhata/util';
import { IFilterParams } from '@eskhata/util';
import { IPaginate } from '@eskhata/util';
import { parseFilterParams } from '@core/utils/filter-util';
import { IUsers } from '@modules/user/user-client/interfaces/users.interface';
import { setDefaultFilterValue } from '@eskhata/util';
import { UserClientConstants } from "@modules/user/user-client/user-client.constants";
import { EbLoaderComponent } from "@shared/components/eb-loader/eb-loader.component";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";

@Component({
  standalone: true,
  selector: 'em-user-client',
  templateUrl: './user-client.component.html',
  styleUrls: ['./user-client.component.scss'],
  providers: [ClientUsersService],
  imports: [TableComponent, ActionsComponent, EMPaginationComponent, EbLoaderComponent, EmHeaderComponent]
})
export class UserClientComponent implements OnInit, AfterViewInit {
  readonly table = viewChild(TableComponent);
  userData: IUsers[];
  loading = signal(false);
  columns: any = UserClientConstants.USER_CLIENT_COLUMNS;
  tableActions: IRowAction[] = UserClientConstants.TABLE_ACTIONS;
  tabMenuItems: ITab[] = UserClientConstants.HEADER_TABS;
  actions: IAction[] = UserClientConstants.USER_CLIENT_ACTIONS;
  captionKey = 'user-client'
  params: Params = {};
  paginate: IPaginate | any;

  protected readonly route = inject(ActivatedRoute);
  protected readonly destroyRef = inject(DestroyRef);
  protected readonly router = inject(Router);
  protected readonly clientService = inject(ClientUsersService);
  private queryParams: IFilterParams = {
    filters: '',
    page: this.route.snapshot.queryParams['Page'] || 1,
    sorts: '',
    pageSize: 15
  };

  ngOnInit(): void {
    this.route.queryParams
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res: Params) => {
        this.params = res;
        this.queryParams = setDefaultFilterValue(res, this.captionKey);
        const params = parseFilterParams(res, this.queryParams, this.columns);
        this.getClientUsers(params);
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
    this.router.navigate([`user/client/detail/${clientUserId}/info`])
      .catch()
  }

  edit(clientUserId: string): void {
    this.router.navigate([`user/client/detail/${clientUserId}/edit`])
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
    this.getClientUsers()
  }

  private getClientUsers(params = this.queryParams): void {
    this.loading.set(true);
    this.clientService.getClientUsers(params)
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(res => {
        if (res.status) {
          this.userData = res.data;
          this.paginate = res.meta.pagination;
        }
      })
  }
}
