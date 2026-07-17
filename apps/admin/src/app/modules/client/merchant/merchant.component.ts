import { AfterViewInit, Component, DestroyRef, inject, OnInit, signal, viewChild } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { MerchantService } from './services/merchant.service';
import { finalize, Subscription } from 'rxjs';
import { DestroyableComponent } from '@core/abstract/destroyable.component';
import { TableComponent } from '@shared/components/table/table.component';
import { ICaption, IOptionAction, IRowAction } from '@core/interfaces/table.interface';
import { IMerchant } from '@modules/client/merchant/interfaces/merchant.interface';
import { IFilterParams } from '@core/interfaces/filter-params.interface';
import { ToastEnum, IPaginate } from '@eskhata/util';
import { MessageService } from '@core/services/message.service';
import { IAction } from '@shared/components/actions/actions.interface';
import { HeaderService } from '@core/services/header.service';
import { parseFilterParams } from '@core/utils/filter-util';
import { setDefaultFilterValue } from '@core/utils/route-param-parse';
import { ConfirmDialogComponent } from '@shared/dialogs/confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { NgxPermissionsService } from 'ngx-permissions';
import { ToastComponent } from "@shared/components/toast/toast.component";
import { MerchantConstants } from "@modules/client/merchant/merchant.constants";
import { ITab } from "@core/interfaces/header.interface";
import { EmHeaderComponent } from "@shared/components/em-header/em-header.component";
import { ActionsComponent } from "@shared/components/actions/actions.component";
import { EMPaginationComponent } from "@shared/components/em-pagination/pagination.component";
import { ClientConstants } from "@modules/client/client.constants";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { EbLoaderComponent } from "@shared/components/eb-loader/eb-loader.component";

@Component({
  standalone: true,
  selector: 'em-merchant',
  templateUrl: './merchant.component.html',
  styleUrls: ['./merchant.component.scss'],
  providers: [MerchantService],
  imports: [
    TableComponent,
    ToastComponent,
    EmHeaderComponent,
    ActionsComponent,
    EMPaginationComponent,
    EbLoaderComponent
  ]
})
export class MerchantComponent extends DestroyableComponent implements AfterViewInit, OnInit {
  readonly table = viewChild(TableComponent);
  companyId: string;
  showBreadcrumbs = false;
  showFilters = true;
  captionKey = 'merchant';
  merchants: IMerchant[];
  loading = signal(false);
  actions: IAction[];
  columns = MerchantConstants.MERCHANT_COLUMNS;
  tableActions: IRowAction[] = MerchantConstants.TABLE_ACTIONS
  optionActions: IOptionAction[] = MerchantConstants.TABLE_SETTING_OPTIONS
  params: Params = {};
  paginate: IPaginate | any;
  tabMenuItems: ITab[];
  private merchantSub: Subscription;
  private destroyRef = inject(DestroyRef);
  private router = inject(Router);
  private service = inject(MerchantService);
  private messageService = inject(MessageService);
  private permissionService = inject(NgxPermissionsService);
  private route = inject(ActivatedRoute);
  private dialog = inject(MatDialog);
  private store = inject(HeaderService);
  private sanitizer = inject(DomSanitizer);

  private queryParams: IFilterParams = {
    filters: '',
    page: this.route.snapshot.queryParams['Page'] || 1,
    pageSize: 15
  };
  constructor() {
    super()
    this.initTabData();
    this.removeCompanyId()
    this.store.setMerchantId(null);
  }

  ngOnInit(): void {
    this.route.queryParams
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res: Params) => {
        this.params = res;
        this.queryParams = setDefaultFilterValue(res, this.captionKey);
        const parsedParams = parseFilterParams(res, this.queryParams, this.columns);

        if (this.companyId) {
          parsedParams.filters = parsedParams.filters
            ? `${parsedParams.filters},companyId==${this.companyId}`
            : `companyId==${this.companyId}`;
        }

        this.queryParams = parsedParams;

        this.getMerchants(parsedParams);

        if (this.companyId) this.changePage();

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
    this.table().render(this.columns, this.merchants)
  }

  showDetail(merchantId: string): void {
    if (!this.permissionService.getPermission('MerchantDetail')) return;
    if (this.companyId) {
      this.router.navigate(['clients/company', this.companyId, 'merchant', merchantId]).catch()
    } else {
      this.router.navigate(['clients/merchant', merchantId]).catch()
    }
  }


  edit(merchantId: string): void {
    if (this.companyId) {
      this.router.navigate(['clients/company', this.companyId, 'merchant', merchantId, 'edit'])
        .catch()
    } else {
      this.router.navigate(['clients/merchant', merchantId, 'edit']).catch()
    }
  }

  sortTable(value: string): void {
    this.queryParams.sorts = value;
    this.getMerchants()
  }

  link(dataDetail: { dataSourceId: string, fieldName: string }): void {
    if (dataDetail.fieldName === 'companyName' && this.permissionService.getPermission('CompanyDetail')) {
      const companyId = this.merchants.find(item => item.id === dataDetail.dataSourceId).companyId;
      this.router.navigate(['clients/company', companyId, 'info']).catch();
    }
  }

  confirmChangeStatus(merchant: IMerchant): void {
    this.dialog.open(ConfirmDialogComponent, {
      disableClose: true,
      panelClass: 'custom-modalbox',
      data: {
        title: this.sanitizer.bypassSecurityTrustHtml(`Вы действительно хотите
                                           <span style="color: ${merchant.isActive ? '#E95B54' : '#11a40c'}">
                                           ${merchant.isActive ? 'Деактивировать' : 'Активировать'}</span>
                                            <span style="font-weight: 700">${merchant.name}</span>?`),
        successButtonText: 'Да',
        cancelButtonText: 'Нет'
      },
      maxWidth: '30vw'
    })
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(res => {
        if (res) {
          this.changeActiveStatus(merchant.id)
        }
      });
  }

  private changeActiveStatus(merchantId: string): void {
    this.loading.set(true);
    this.service.changeActiveStatus(merchantId)
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(res => {
        this.messageService.add({severity: res.status ? ToastEnum.SUCCESS : ToastEnum.ERROR, summary: res.message});
        if (res.status) {
          this.getMerchants()
        }
      })
  }


  private getMerchants(params = this.queryParams): void {
    this.loading.set(true);
    if (this.merchantSub && !this.merchantSub.closed) {
      this.merchantSub.unsubscribe();
    }
    this.merchantSub = this.service.getMerchants(params)
      .pipe(
        takeUntilDestroyed(this.destroyRef))
      .subscribe(res => {
        if (res.status) {
          this.merchants = res.data;
          this.paginate = res.meta.pagination;
          this.store.setPage(res.meta.pagination)
        } else {
          this.messageService.add({severity: ToastEnum.ERROR, summary: res.message})
        }
        this.loading.set(false)
      })
  }

  private changePage(): void {
    this.store.getPageChange()
      .pipe(takeUntilDestroyed(this.destroyRef))
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

  private removeCompanyId(): void {
    if (!this.companyId) {
      this.store.setCompanyId(null)
    }
  }

  private initTabData(): void {
    this.store.getCompanyId()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(companyId => {
        this.companyId = companyId;
        if (this.companyId) {
          this.getTabItems();
        } else {
          this.tabMenuItems = ClientConstants.HEADERS_TABS
          this.actions = MerchantConstants.MERCHANT_ACTION
        }
      })

    this.route.data.subscribe(data => {
      const fromCompany = this.route.parent?.snapshot.data['fromCompany'] ?? false;
      this.showBreadcrumbs = data['fromCompany'] ?? false;
      this.showFilters = !fromCompany;
    });
  }

  private getTabItems(): void {
    this.store.getBankAcquirer()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(res => {
        this.tabMenuItems = res ?
          MerchantConstants.getHeaderAcquirerTabs(this.companyId) :
          MerchantConstants.getHeaderTabs(this.companyId);
        this.actions = MerchantConstants.getAction(this.companyId);
      });
  }
}
