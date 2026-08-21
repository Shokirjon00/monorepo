import {
  AfterViewInit,
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal,
  viewChild
} from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { combineLatest, finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActionsComponent, EmHeaderComponent, EMPaginationComponent, TableComponent } from '@eskhata/ui';
import { AccountService } from '@core/services/account.service';
import { HeaderService } from '@core/services/header.service';
import { IPaginate } from '@eskhata/util';
import { IFilterParams } from '@eskhata/util';
import { IAccount } from '@modules/client/company/interfaces/account.interface';
import { ITab } from '@eskhata/util';
import { IAction } from '@eskhata/util';
import { parseFilterParams } from '@core/utils/filter-util';
import { setDefaultFilterValue } from '@core/utils';
import { SystemAccountConstants } from './system-account.constants';
import { MerchantConstants } from '@modules/client/merchant/merchant.constants';
import {ICaption} from "@core/interfaces";

@Component({
  standalone: true,
  selector: 'em-system-account',
  templateUrl: './system-account.component.html',
  styleUrls: ['./system-account.component.scss'],
  providers: [AccountService],
  imports: [
    TableComponent,
    ActionsComponent,
    EMPaginationComponent,
    EmHeaderComponent
  ]
})
export class SystemAccountComponent implements OnInit, AfterViewInit {

  readonly table = viewChild(TableComponent);

  loading = signal(false);

  systemAccounts: IAccount[];
  tabMenuItems: ITab[];
  actions: IAction[];
  paginate: IPaginate;

  readonly captions = SystemAccountConstants.SYSTEM_ACCOUNT_COLUMNS;
  readonly captionKey = 'system-account';

  private companyId: string;
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private service = inject(AccountService);
  private store = inject(HeaderService);
  private destroyRef = inject(DestroyRef);

  private queryParams: IFilterParams = {
    filters: '',
    page: this.route.snapshot.queryParams['page'] || 1,
    sorts: '',
    pageSize: 15
  };

  ngOnInit(): void {
    this.subscribeToParams();
  }

  ngAfterViewInit(): void {
    this.captions.map((x: any, i: any,) => ({
      key: x,
      index: i,
      isSelected: true
    } as ICaption));
    this.table()?.render(this.captions, this.systemAccounts);
  }

  detail(systemAccountId: string): void {
    this.router
      .navigate(['clients/company', this.companyId, 'system-accounts', systemAccountId])
      .catch();
  }

  private subscribeToParams(): void {
    combineLatest([
      this.route.queryParams,
      this.store.getCompanyId()
    ])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(([params, companyId]) => {
        if (!companyId) return;

        const isFirstInit = !this.companyId;
        this.companyId = companyId;

        if (isFirstInit) this.initData();

        this.handleQueryParams(params);
      });
  }

  private handleQueryParams(params: Params): void {
    this.queryParams = setDefaultFilterValue(params, this.captionKey);

    const parsedParams = parseFilterParams(
      params,
      this.queryParams,
      this.captions
    );

    this.queryParams = parsedParams;
    this.getSystemAccounts(parsedParams);
  }

  private getSystemAccounts(params: IFilterParams): void {
    this.loading.set(true);

    this.service.getSystemAccounts(this.companyId, params)
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(res => {
        if (res?.status) {
          this.systemAccounts = res.data;
          this.paginate = res.meta.pagination;
        }
      });
  }

  private initData(): void {
    this.store.getBankAcquirer()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(res => {
        this.tabMenuItems = res
          ? MerchantConstants.getHeaderAcquirerTabs(this.companyId)
          : MerchantConstants.getHeaderTabs(this.companyId);

        this.actions = SystemAccountConstants.getAction(this.companyId);
      });
  }
}
