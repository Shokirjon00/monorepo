import { AfterViewInit, Component, DestroyRef, inject, OnInit, signal, viewChild } from '@angular/core';
import { SupportCenterConstants } from "@modules/support-center/support-center.constants";
import { EmHeaderComponent, EMPaginationComponent, TableComponent } from '@eskhata/ui';
import { ICaption, IFilterParams, IPaginate, IRowAction } from "@core/interfaces";
import { combineLatest, EMPTY, finalize, Observable } from "rxjs";
import { ActivatedRoute, Params, Router } from "@angular/router";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { parseFilterParams } from "@core/utils";
import { SupportCenterService } from "@modules/support-center/services/support-center.service";
import { distinctUntilChanged, map, switchMap } from "rxjs/operators";
import { MatDialog } from "@angular/material/dialog";
import { ChangeStatusModalComponent } from "@shared/dialogs/change-status-modal/change-status-modal.component";
import { ToastEnum } from '@eskhata/util';
import { MessageService } from "@core/services";
import { UserAdminService } from "@modules/user/user-admin/services/user-admin.service";
import { SetOperatorModalComponent } from "@shared/dialogs/set-operator-modal/set-operator-modal.component";
import { EbLoaderComponent } from "@shared/components/eb-loader/eb-loader.component";
import { ISupportCenterInterfaces } from "@modules/support-center/interfaces/support-center.interfaces";
import { ComponentType } from '@angular/cdk/portal';
import {
  ChangeStatusDialogData,
  LoadUsersResponse
} from "@modules/support-center/interfaces/support-application.model";

@Component({
  selector: 'em-support-center',
  standalone: true,
  imports: [
    EmHeaderComponent,
    TableComponent,
    EMPaginationComponent,
    EbLoaderComponent
  ],
  templateUrl: './support-center.component.html',
  styleUrl: './support-center.component.scss',
  providers: [SupportCenterService, UserAdminService],
})
export class SupportCenterComponent implements OnInit, AfterViewInit {
  readonly table = viewChild(TableComponent);
  tabMenuItems = SupportCenterConstants.HEADER_TABS;
  columns = SupportCenterConstants.SUPPORT_COLUMNS;
  tableActions: IRowAction[] = SupportCenterConstants.TABLE_ACTIONS;
  statusId = signal<string | null>(null);
  support: ISupportCenterInterfaces[];
  paginate: IPaginate | any;
  params: Params = {};
  captionKey = 'support-center-cols';
  loading = signal(false);

  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly service = inject(SupportCenterService);
  private readonly userService = inject(UserAdminService);
  private readonly messageService = inject(MessageService);

  private queryParams: IFilterParams = {
    page: this.route.snapshot.queryParams['Page'] || 1,
    pageSize: 15
  };

  ngOnInit(): void {
    this.initRouteParams();
  }

  ngAfterViewInit(): void {
    this.columns.map((x: any, i: any,) => ({
      key: x,
      index: i,
      isSelected: true
    } as ICaption));
    this.table().render(this.columns, this.support);
  }

  sortTable(value: string): void {
    this.queryParams.sorts = value;
    this.getSupport();
  }

  showDetail(allowListId: string): void {
    this.router.navigate(['help/info', allowListId]).catch();
  }

  private getSupport(params = this.queryParams): void {
    this.loading.set(true);
    this.service.getSupport(params)
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(res => {
        if (res.status) {
          this.support = res.data;
          this.paginate = res.meta.pagination;
        }
      })
  }

  private initRouteParams(): void {
    combineLatest([
      this.route.paramMap,
      this.route.queryParams.pipe(
        distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr))
      )
    ])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(([params, query]) => {
        const typeUrl = params.get('type') || 'all';
        this.params = {
          ...query
        };
        this.queryParams.page = +this.params['page'] || 1;
        this.queryParams.pageSize = +this.params['pageSize'] || 15;
        const statusId = SupportCenterConstants.getStatusIdFromPath(typeUrl);
        if (statusId) {
          this.params['SupportApplicationStatusId'] = statusId;
          this.statusId.set(statusId);
        } else {
          delete this.params['SupportApplicationStatusId'];
          this.statusId.set(null);
        }
        this.queryParams.filters = parseFilterParams(this.params, this.queryParams, this.columns).filters;
        this.getSupport();
      });
  }

  private handleGenericResponse(response: any): void {
    if (response.status) {
      this.messageService.add({
        severity: ToastEnum.SUCCESS,
        summary: response.message
      });
      this.getSupport();
    } else {
      const errorMessage =
        response.errors?.requestError?.[0] ||
        response.errors?.supportApplicationStatusId?.[0] ||
        response.message;

      this.messageService.add({
        severity: ToastEnum.ERROR,
        summary: errorMessage
      });
    }
  }

  openReceiptDialog(rowId: string): void {
    const dialogData: ChangeStatusDialogData = {
      title: 'Изменить статус',
      rowId,
      statusOptions: null,
    };
    this.loadDialogStatusOptions()
      .pipe(
        switchMap((options: { id: string, name: string }[]) => {
          dialogData.statusOptions = options
          return this.openGenericDialog(dialogData, ChangeStatusModalComponent)
        }),
        switchMap(result => {
          if (result?.selectedStatusId) {
            return this.changeOrderStatus(rowId, result.selectedStatusId);
          }
          return EMPTY;
        })
      )
      .subscribe((res) => {
        if (res) {
          this.handleGenericResponse(res)
        }
      })
  }

  openUserDialog(rowId: string): void {
    const dialogData: ChangeStatusDialogData  = {
      title: 'Назначить оператора',
      rowId,
      userOptions: [],
      loadUsers: (page: number, search?: string) => this.loadDialogUserOptions(page, search)
    };

    this.openGenericDialog(dialogData, SetOperatorModalComponent)
      .pipe(
        switchMap(result => {
          if (result?.selectedStatusId) {
            return this.changeUserStatus(rowId, result.selectedStatusId);
          }
          return EMPTY;
        })
      )
      .subscribe((res) => {
        if (res) {
          this.handleGenericResponse(res);
        }
      });
  }

  private changeOrderStatus(supportApplicationId: string, supportApplicationStatusId:string): Observable<any>{
    const body = {
      supportApplicationId,
      supportApplicationStatusId
    }
    return this.service.changeOrderStatus(body);
  }

  private changeUserStatus(supportApplicationId: string, adminUserId:string): Observable<any>{
    const body = {
      supportApplicationId,
      adminUserId
    }
    return this.service.changeUser(body);
  }

  private openGenericDialog(dialogData: ChangeStatusDialogData, dialogComponent: ComponentType<unknown>): Observable<any> {
    return this.dialog.open(dialogComponent, {
      disableClose: true,
      panelClass: 'no-style-dialog',
      data: dialogData
    }).afterClosed();
  }

  private loadDialogStatusOptions(): Observable<{ id: string, name: string }[]> {
    return this.service.getReceiptType().pipe(
      map((statusResponse) =>
        statusResponse.data.map(item => ({
          id: item.id,
          name: item.name
        }))
      )
    );
  }

  private loadDialogUserOptions(page = 1, search = ''): Observable<LoadUsersResponse> {
    const params: any = { page };

    if (search.trim()) {
      params['filters'] = `fullName @=* ${search.trim()}`;
    }

    return this.userService.getReceiptType(params).pipe(
      map((response) => ({
        users: response.data.map(item => ({
          id: item.id,
          name: item.fullName
        })),
        hasNextPage: response.meta.pagination.hasNextPage,
        nextPage: response.meta.pagination.pageNumber + 1
      }))
    );
  }
}
