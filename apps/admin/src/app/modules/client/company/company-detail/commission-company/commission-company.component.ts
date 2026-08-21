import { AfterViewInit, Component, DestroyRef, inject, OnInit, signal, WritableSignal, viewChild } from '@angular/core';
import { DestroyableComponent } from '@eskhata/util';
import { ActionsComponent, EmHeaderComponent, EMPaginationComponent, TableComponent, ToastComponent } from '@eskhata/ui';
import { ICaption, IOptionAction, IRowAction } from '@eskhata/util';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { finalize, takeUntil } from 'rxjs';
import { IFilterParams } from '@eskhata/util';
import { HeaderService } from '@core/services/header.service';
import { IPaginate, ToastEnum } from '@eskhata/util';
import { parseFilterParams } from '@core/utils/filter-util';
import { ITab } from '@eskhata/util';
import { IAction } from '@eskhata/util';
import { MerchantConstants } from "@modules/client/merchant/merchant.constants";
import {
  CommissionCompanyConstants
} from "@modules/client/company/company-detail/commission-company/commission-company.constants";
import {
  CommissionCompanyService
} from "@modules/client/company/company-detail/commission-company/services/commission-company.service";
import {
  ICommissionCompany
} from "@modules/client/company/company-detail/commission-company/interfaces/commission-company.interface";
import { ConfirmDialogComponent } from "@shared/dialogs/confirm-dialog/confirm-dialog.component";
import { MatDialog } from "@angular/material/dialog";
import { DomSanitizer } from "@angular/platform-browser";
import { DatePipe } from "@angular/common";
import { MessageService } from "@core/services";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

@Component({
  standalone: true,
  selector: 'em-cashback-company',
  templateUrl: './commission-company.component.html',
  styleUrls: ['./commission-company.component.scss'],
  providers: [CommissionCompanyService, DatePipe],
  imports: [
    TableComponent,
    ToastComponent,
    ActionsComponent,
    EMPaginationComponent,
    EmHeaderComponent
  ]
})
export class CommissionCompanyComponent extends DestroyableComponent implements OnInit, AfterViewInit {
  readonly table = viewChild(TableComponent);
  companyId: string;
  commCompanies: ICommissionCompany[];
  columns = CommissionCompanyConstants.COMMISSION_COMPANY_COLUMNS;
  tableActions: IRowAction[] = CommissionCompanyConstants.TABLE_ACTIONS;
  optionActions: IOptionAction[] = CommissionCompanyConstants.TABLE_SETTING_OPTIONS;
  captionKey = 'commission-company';
  tabMenuItems: ITab[];
  paginate: IPaginate | any;
  params: Params = {};
  actions: IAction[];

  readonly route = inject(ActivatedRoute);
  readonly loading: WritableSignal<boolean> = signal(false);
  private queryParams: IFilterParams = {
    filters: '',
    page: this.route.snapshot.queryParams['Page'] || 1,
    sorts: '',
    pageSize: 15
  };
  private readonly router = inject(Router);
  private readonly service = inject(CommissionCompanyService);
  private readonly store = inject(HeaderService);
  private readonly dialog = inject(MatDialog);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly datePipe = inject(DatePipe);
  private readonly messageService = inject(MessageService);
  private readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.initTabData();
    this.handleQueryParams();
  }

  ngAfterViewInit(): void {
    this.columns.map((x: any, i: any,) => ({
      key: x,
      index: i,
      isSelected: true
    } as ICaption))
    this.table().render(this.columns, this.commCompanies);
  }

  showDetail(commissionCompanyId: string): void {
    this.router.navigate([`clients/company/${this.companyId}/commission/info`, commissionCompanyId])
      .catch();
  }

  edit(id: string): void {
    this.loading.set(true);
    this.service.getCommissionCompanyDetail(id)
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(res => {
        if (res.status) {
          this.router.navigate([`clients/company/${this.companyId}/commission/edit`, id]).catch();
        } else {
          this.messageService.add({severity: ToastEnum.ERROR, summary: res.message});
        }
      })
  }

  sortTable(value: string): void {
    this.queryParams.sorts = value;
    this.getCommissionCompanyList();
  }

  confirmChangeStatus(commission: ICommissionCompany): void {
    const formattedStart = this.datePipe.transform(commission.startDate, 'dd.MM.yyyy HH:mm');
    const formattedEnd = this.datePipe.transform(commission.endDate, 'dd.MM.yyyy HH:mm');
    this.dialog.open(ConfirmDialogComponent, {
      disableClose: true,
      panelClass: 'custom-modalbox',
      data: {
        title: this.sanitizer.bypassSecurityTrustHtml(`Вы действительно хотите
                                           <span style="color: ${commission.isActive ? '#E95B54' : '#11a40c'}">
                                           ${commission.isActive ? 'Деактивировать' : 'Активировать'}</span>
                                            <span style="font-weight: 700">Комиссию</span>?
                                            <ul style="text-align: start">
          <li>${commission.commissionName}</li>
          <li>${commission.commissionTypeName}</li>
          <li>
            <div style="display: flex; gap: 0.2rem">
              c <span>${formattedStart}</span> по <span>${formattedEnd}</span>
            </div>
          </li>
        </ul>
                                            `),
        successButtonText: 'Да',
        cancelButtonText: 'Нет'
      },
      maxWidth: '30vw'
    })
      .afterClosed()
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => {
        if (res) {
          this.changeActiveStatus(commission.id)
        }
      });
  }

  private changeActiveStatus(merchantId: string): void {
    this.loading.set(true);
    this.service.changeActiveStatus(merchantId)
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntil(this.destroyed$)
      )
      .subscribe(res => {
        if (res.status) {
          this.messageService.add({
            severity: ToastEnum.SUCCESS,
            summary: res.message
          });
          this.getCommissionCompanyList();
        } else {
          const requestError = res.errors?.requestError?.[0];
          this.messageService.add({
            severity: ToastEnum.WARN,
            summary: requestError || res.message
          });
        }
      });
  }

  private handleQueryParams(): void {
    this.route.queryParams
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res) => {
        this.params = res;
        this.queryParams.page = res['page'];
        this.queryParams.pageSize = res['pageSize'];

        const params = parseFilterParams(res, this.queryParams, this.columns);

        if (this.companyId) {
          this.queryParams.filters = `companyId==${this.companyId}`;
        }

        if (this.params['module'] && this.captionKey !== this.params['module']) {
          this.queryParams.page = 1;
        } else {
          this.queryParams.module = this.captionKey;
        }

        this.getCommissionCompanyList(params);

        if (this.companyId) {
          this.changePage();
        }

        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: this.params
        }).catch();
      });
  }

  private getCommissionCompanyList(params = this.queryParams): void {
    this.loading.set(true);
    this.service.getCommissionList(params)
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(res => {
        this.commCompanies = res.data;
        this.paginate = res.meta.pagination;
        this.store.setPage(this.paginate);
      })
  }

  private changePage(): void {
    this.store.getPageChange()
      .pipe(takeUntilDestroyed(this.destroyRef))
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
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(companyId => this.companyId = companyId);
    if (this.companyId) {
      this.getTabItems();
    }
  }

  private getTabItems(): void {
    this.store.getBankAcquirer()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(res => {
        this.tabMenuItems = res ? MerchantConstants.getHeaderAcquirerTabs(this.companyId) : MerchantConstants.getHeaderTabs(this.companyId);
        this.actions = CommissionCompanyConstants.getAction(this.companyId);
      });
  }
}
