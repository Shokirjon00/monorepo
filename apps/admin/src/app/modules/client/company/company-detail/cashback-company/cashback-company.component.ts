import { AfterViewInit, Component, inject, OnInit, viewChild } from '@angular/core';
import { DestroyableComponent } from '@core/abstract/destroyable.component';
import { TableComponent } from '@shared/components/table/table.component';
import { ICaption, IRowAction } from '@core/interfaces/table.interface';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { finalize, takeUntil } from 'rxjs';
import { IFilterParams } from '@core/interfaces/filter-params.interface';
import { HeaderService } from '@core/services/header.service';
import { IPaginate } from '@eskhata/util';
import { ICashbackCompany } from '@modules/client/company/company-detail/cashback-company/interfaces/cashback-company.interface';
import { CashbackCompanyService } from '@modules/client/company/company-detail/cashback-company/services/cashback-company.service';
import { parseFilterParams } from '@core/utils/filter-util';
import { ToastComponent } from "@shared/components/toast/toast.component";
import { ActionsComponent } from "@shared/components/actions/actions.component";
import { EMPaginationComponent } from "@shared/components/em-pagination/pagination.component";
import { EmHeaderComponent } from "@shared/components/em-header/em-header.component";
import { ITab } from "@core/interfaces/header.interface";
import { CashbackCompanyConstants } from "@modules/client/company/company-detail/cashback-company/cashback-company.constants";
import { IAction } from "@shared/components/actions/actions.interface";
import { MerchantConstants } from "@modules/client/merchant/merchant.constants";

@Component({
  standalone: true,
  selector: 'em-cashback-company',
  templateUrl: './cashback-company.component.html',
  styleUrls: ['./cashback-company.component.scss'],
  providers: [CashbackCompanyService],
  imports: [
    TableComponent,
    ToastComponent,
    ActionsComponent,
    EMPaginationComponent,
    EmHeaderComponent
]
})
export class CashbackCompanyComponent extends DestroyableComponent implements OnInit, AfterViewInit {
  readonly table = viewChild(TableComponent);
  companyId: string;
  loading: boolean;
  cashCompanies: ICashbackCompany[];
  columns = CashbackCompanyConstants.CASHBACK_COMPANY_COLUMNS;
  tableActions: IRowAction[] = CashbackCompanyConstants.TABLE_ACTIONS
  captionKey = 'cashback-company';
  tabMenuItems: ITab[];
  paginate: IPaginate | any;
  params: Params = {};
  actions: IAction[];

  private router = inject(Router);
  private service = inject(CashbackCompanyService);
  private store = inject(HeaderService);
  private route = inject(ActivatedRoute);

  private queryParams: IFilterParams = {
    filters: '',
    page: this.route.snapshot.queryParams['Page'] || 1,
    sorts: '',
    pageSize: 15
  };

  constructor() {
    super();
    this.initTabData();
  }

  ngOnInit(): void {
    this.route.queryParams
      .pipe(takeUntil(this.destroyed$))
      .subscribe((res) => {
        this.params = res;
        this.queryParams.page = res['page']
        this.queryParams.pageSize = res['pageSize']
        const params = parseFilterParams(res, this.queryParams, this.columns);
        if (this.companyId) {
          this.queryParams.filters = `companyId==${this.companyId}`;
        }
        if (this.params['module'] && this.captionKey !== this.params['module']) {
          this.queryParams.page = 1
        } else {
          this.queryParams.module = this.captionKey;
        }
        this.getCashbacks(params)
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
    } as ICaption))
    this.table().render(this.columns, this.cashCompanies)
  }

  showDetail(cashbackCompanyId: string): void {
    this.router.navigate([`clients/company/${this.companyId}/cashback/info`, cashbackCompanyId])
      .catch();
  }

  edit(cashbackCompanyId: string): void {
    this.router.navigate([`clients/company/${this.companyId}/cashback/edit`, cashbackCompanyId])
      .catch();
  }

  sortTable(value: string): void {
    this.queryParams.sorts = value;
    this.getCashbacks();
  }

  private getCashbacks(params = this.queryParams): void {
    this.loading = true;
    this.service.getCashbackCompanies(params)
      .pipe(
        finalize(() => this.loading = false),
        takeUntil(this.destroyed$)
      )
      .subscribe(res => {
        this.cashCompanies = res.data;
        this.paginate = res.meta.pagination;
        this.store.setPage(this.paginate);
      })
  }

  private changePage(): void {
    this.store.getPageChange()
      .pipe(takeUntil(this.destroyed$))
      .subscribe(pageChange => {
        if (pageChange) {
          this.queryParams.page = pageChange.pageNumber;
          this.queryParams.pageSize = pageChange.pageSize;
          this.router.navigate([],
            {
              relativeTo: this.route,
              queryParams: this.queryParams
            }).catch();
        }
      });
  }

  private initTabData(): void {
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
        this.actions = CashbackCompanyConstants.getAction(this.companyId);
      });
  }
}
