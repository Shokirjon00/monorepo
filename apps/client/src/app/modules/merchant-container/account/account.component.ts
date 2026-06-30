import { AfterViewInit, Component, DestroyRef, inject, OnInit, viewChild } from '@angular/core';
import { TableComponent } from "@shared/components/table/table.component";
import { ICaption } from "@core/interfaces/table.interface";
import { ActivatedRoute, Params, Router } from "@angular/router";
import { AccountService } from "@modules/merchant-container/account/services/account.service";
import { finalize } from "rxjs";
import { MessageService } from "@core/services/message.service";
import { IPaginate } from "@core/interfaces/paginate.interface";
import { IFilterParams } from "@core/interfaces/filter-params.interface";
import { IAccount } from "@modules/merchant-container/account/interfaces/account.interface";
import { parseFilterParams } from "@core/utils/filter-util";
import { isPhone } from '@core/helper';
import { ToastEnum } from "@core/enums/toast-enum";
import { SharedModule } from "@shared/shared.module";
import { EskhataBankLoaderComponent } from "@shared/components/eskhata-bank-loader/eskhata-bank-loader.component";
import { AccountConstants } from "@modules/merchant-container/account/account.constants";
import { MerchantConstants } from "@modules/merchant-container/merchant/merchant.constants";
import { ActionsComponent } from "@shared/components/actions/actions.component";
import { EMPaginationComponent } from "@shared/components/em-pagination/pagination.component";
import { EmHeaderComponent } from "@shared/components/em-header/em-header.component";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { AccountMobileCardComponent } from "@modules/merchant-container/account/account-mobile-card/account-mobile-card.component";
import { restoreQueryParamsIfEmpty } from "@core/utils/restore-query-params";


@Component({
  standalone: true,
  selector: 'em-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss'],
  imports: [
    SharedModule,
    EskhataBankLoaderComponent,
    TableComponent,
    ActionsComponent,
    EMPaginationComponent,
    EmHeaderComponent,
    AccountMobileCardComponent
  ],
  providers: [AccountService]
})
export class AccountComponent implements OnInit, AfterViewInit {
  readonly table = viewChild(TableComponent);
  loading: boolean;
  accounts: IAccount[];
  captions = AccountConstants.ACCOUNT_COLUMNS;
  actions = AccountConstants.ACCOUNT_ACTION;
  tabMenuItems = MerchantConstants.HEADER_TABS;
  captionKey = 'accountFiltersForm';
  paginate: IPaginate | any;
  params: Params = {};
  showScrollButton: boolean = false;
  readonly isMobile = isPhone();

  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly messageService = inject(MessageService);
  private readonly service = inject(AccountService);

  private queryParams: IFilterParams = {
    filters: '',
    page: this.route.snapshot.queryParams['Page'] || 1,
    sorts: '',
    pageSize: 15
  };

  ngOnInit(): void {
    this.route.queryParams
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res) => {
        restoreQueryParamsIfEmpty(this.captionKey, this.route, this.router);
        this.params = res;
        this.queryParams.page = res['page'];
        this.queryParams.pageSize = res['pageSize'];
        const params = parseFilterParams(res, this.queryParams, this.captions);
        if (this.params['module'] && this.captionKey !== this.params['module']) {
          this.queryParams.page = 1;
        } else {
          this.queryParams.module = this.captionKey;
        }
        this.getAccounts(params);
      });
  }

  ngAfterViewInit(): void {
    this.captions.map((x: any, i: any,) => ({
      key: x,
      index: i,
      isSelected: true
    } as ICaption))
    this.table().render(this.captions, this.accounts)
  }

  sortTable(value: string): void {
    this.queryParams.sorts = value;
    this.getAccounts()
  }

  private getAccounts(params = this.queryParams): void {
    this.loading = true;
    this.service.getAccounts(params)
      .pipe(
        finalize(() => this.loading = false),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(res => {
        if (res.status) {
          this.accounts = res.data;
          this.paginate = res.meta.pagination;
        } else {
          this.messageService.add({severity: ToastEnum.ERROR, summary: res.message})
        }
        this.loading = false;
      })
  }
}
