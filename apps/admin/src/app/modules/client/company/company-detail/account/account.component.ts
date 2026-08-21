import { AfterViewInit, Component, inject, OnDestroy, OnInit, viewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActionsComponent, EmHeaderComponent, EMPaginationComponent, TableComponent, ToastComponent } from '@eskhata/ui';
import { ICaption, IRowAction } from '@eskhata/util';
import { DestroyableComponent } from '@eskhata/util';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { AccountService } from '@core/services/account.service';
import { finalize, takeUntil } from 'rxjs';
import { AccountEditDialogComponent } from '@modules/client/company/company-detail/account-edit-dialog/account-edit-dialog.component';
import { IPaginate } from '@eskhata/util';
import { IFilterParams } from '@eskhata/util';
import { IAccount } from '@modules/client/company/interfaces/account.interface';
import { HeaderService } from '@core/services/header.service';
import { parseFilterParams } from '@core/utils/filter-util';
import { AccountConstants } from "@modules/client/company/company-detail/account/account.constants";

import { IAction } from '@eskhata/util';
import { ITab } from '@eskhata/util';
import { MerchantConstants } from "@modules/client/merchant/merchant.constants";

@Component({
  standalone: true,
  selector: 'em-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss'],
  providers: [AccountService],
  imports: [TableComponent, ToastComponent, ActionsComponent, EMPaginationComponent, EmHeaderComponent]
})
export class AccountComponent extends DestroyableComponent implements OnInit, AfterViewInit, OnDestroy {
  readonly table = viewChild(TableComponent);
  loading: boolean;
  accounts: IAccount[];
  actions: IAction[];
  tabMenuItems: ITab[];
  columns = AccountConstants.ACCOUNT_COLUMNS;
  tableActions: IRowAction[] = AccountConstants.TABLE_ACTIONS;
  captionKey = 'account';
  paginate: IPaginate | any;
  companyId: string;
  params: Params = {}

  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly service = inject(AccountService);
  private readonly route = inject(ActivatedRoute);
  private readonly store = inject(HeaderService);

  private queryParams: IFilterParams = {
    filters: '',
    page: this.route.snapshot.queryParams['Page'] || 1,
    sorts: '',
    pageSize: 15
  };

  constructor() {
    super();
    this.initData();
  }

  ngOnInit(): void {
    this.store.getDialog()
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => {
        if (res === 'account-dialog') {
          this.addAccount();
        }
      });
    this.route.queryParams
      .pipe(takeUntil(this.destroyed$))
      .subscribe((res: Params) => {
        this.params = res;
        this.queryParams.page = res['page']
        this.queryParams.pageSize = res['pageSize']
        const params = parseFilterParams(res, this.queryParams, this.columns);
        if (this.companyId) {
          this.queryParams.filters = `companyId==${this.companyId}`;
        }
        if (this.params['module'] && this.captionKey !== this.params['module']) {
          this.queryParams.page = 1;
        } else {
          this.queryParams.module = this.captionKey;
        }
        this.getAccounts(params);
        if (this.companyId) {
          this.changePage();
        }
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
    this.table().render(this.columns, this.accounts);
  }

  override ngOnDestroy(): void {
    this.store.setDialog('');
    super.ngOnDestroy();
  }

  detail(accountId: string): void {
    this.router.navigate(['clients/company', this.companyId, 'accounts', accountId]).catch()
  }

  edit(accountId: string): void {
    const dialogRef = this.dialog.open(AccountEditDialogComponent, {
      data: {
        id: accountId,
        companyId: this.companyId
      },
      disableClose: true,
      panelClass: 'custom-modalbox',
    });
    dialogRef.afterClosed()
      .pipe(takeUntil(this.destroyed$))
      .subscribe(result => {
        if (result) {
          this.getAccounts();
        }
      });
  }

  sortTable(value: string): void {
    this.queryParams.sorts = value;
    this.getAccounts();
  }

  private getAccounts(params = this.queryParams): void {
    this.loading = true;
    this.service.getAccounts(this.companyId, params)
      .pipe(
        finalize(() => this.loading = false),
        takeUntil(this.destroyed$)
      )
      .subscribe(res => {
        this.accounts = res.data;
        this.paginate = res.meta.pagination;
      })
  }

  private initData(): void {
    this.store.getCompanyId()
      .pipe(takeUntil(this.destroyed$))
      .subscribe(companyId => this.companyId = companyId);
    if (this.companyId) {
      this.getTabItems();
    }
  }

  private getTabItems(): void {
    this.store.getBankAcquirer()
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => {
        this.tabMenuItems = res ? MerchantConstants.getHeaderAcquirerTabs(this.companyId) : MerchantConstants.getHeaderTabs(this.companyId);
        this.actions = AccountConstants.getAction(this.companyId);
      });
  }

  private changePage(): void {
    this.store.getPageChange()
      .pipe(takeUntil(this.destroyed$))
      .subscribe(pageChange => {
        if (pageChange) {
          this.queryParams.page = pageChange.pageNumber;
          this.queryParams.pageSize = pageChange.pageSize
          this.router.navigate([],
            {
              relativeTo: this.route,
              queryParams: this.queryParams
            }).catch();
        }
      });
  }

  private addAccount(): void {
    const dialogExist = this.dialog.getDialogById('account-dialog');
    if (dialogExist) return;
    const dialogRef = this.dialog.open(AccountEditDialogComponent, {
      disableClose: true,
      panelClass: 'custom-modalbox',
      id: 'account-dialog',
      data: {companyId: this.companyId, path: 'new'},
    });
    dialogRef.afterClosed()
      .pipe(takeUntil(this.destroyed$))
      .subscribe(result => {
        if (result) {
          this.getAccounts();
        }
      });
  }
}
