import { AfterViewInit, Component, inject, OnInit, viewChild } from '@angular/core';
import { finalize, takeUntil } from 'rxjs';
import { HeaderService } from '@core/services/header.service';
import { DestroyableComponent } from '@core/abstract/destroyable.component';
import { TableComponent } from '@shared/components/table/table.component';
import { ICaption, IRowAction } from '@core/interfaces/table.interface';
import { IPaginate, ToastEnum } from '@eskhata/util';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { IFilterParams } from '@core/interfaces/filter-params.interface';
import { MessageService } from '@core/services/message.service';
import { parseFilterParams } from '@core/utils/filter-util';
import { CompanyService } from '@modules/client/company/services/company.service';
import { IAcquirer } from '@core/interfaces/acquirer.interface';
import { MatDialog } from '@angular/material/dialog';
import { CompanyAcquirerCreateDialogComponent } from '@modules/client/company/company-detail/company-acquirer-create-dialog/company-acquirer-create-dialog.component';
import { ToastComponent } from '@shared/components/toast/toast.component';
import { ConfirmDialogComponent } from '@shared/dialogs/confirm-dialog/confirm-dialog.component';
import { CompanyAcquirerConstants } from "@modules/client/company/company-detail/company-acquirer/company-acquirer.constants";
import { ActionsComponent } from "@shared/components/actions/actions.component";
import { EMPaginationComponent } from "@shared/components/em-pagination/pagination.component";
import { EmHeaderComponent } from "@shared/components/em-header/em-header.component";

import { IAction } from "@shared/components/actions/actions.interface";
import { ITab } from "@core/interfaces/header.interface";
import { MerchantConstants } from "@modules/client/merchant/merchant.constants";

@Component({
  standalone: true,
  selector: 'em-company-acquirer',
  templateUrl: './company-acquirer.component.html',
  styleUrls: ['./company-acquirer.component.scss'],
  imports: [
    TableComponent,
    ToastComponent,
    ActionsComponent,
    EMPaginationComponent,
    EmHeaderComponent
]
})
export class CompanyAcquirerComponent extends DestroyableComponent implements OnInit, AfterViewInit {
  readonly table = viewChild(TableComponent);
  loading: boolean;
  companyAcquirers: IAcquirer[];
  captions = CompanyAcquirerConstants.COMPANY_ACQUIRER_COLUMNS
  tableActions: IRowAction[] = CompanyAcquirerConstants.TABLE_ACTIONS
  captionKey = 'company-acquirers'
  actions: IAction[];
  tabMenuItems: ITab[];
  paginate: IPaginate | any;
  companyId: string;
  params: Params = {}

  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly messageService = inject(MessageService);
  private readonly store = inject(HeaderService);
  private readonly service = inject(CompanyService);
  private readonly dialog = inject(MatDialog);

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
        if (res === 'company-acquirer-dialog') {
          this.addCompanyAcquirer();
        }
      });
    this.route.queryParams
      .pipe(takeUntil(this.destroyed$))
      .subscribe((res: Params) => {
        this.params = res;
        this.queryParams.page = res['page']
        this.queryParams.pageSize = res['pageSize']
        const params = parseFilterParams(res, this.queryParams, this.captions);
        if (this.companyId) {
          this.queryParams.filters = `companyId==${this.companyId}`;
        }
        if (this.params['module'] && this.captionKey !== this.params['module']) {
          this.queryParams.page = 1
        } else {
          this.queryParams.module = this.captionKey;
        }
        this.getCompanyAcquirers(params);
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
    this.captions.map((x: any, i: any,) => ({
      key: x,
      index: i,
      isSelected: true
    } as ICaption));
    this.table().render(this.captions, this.companyAcquirers)
  }

  sortTable(value: string): void {
    this.queryParams.sorts = value;
    this.getCompanyAcquirers()
  }

  deleteCompanyAcquirer(companyAcquirerId: string): void {
    this.dialog.open(ConfirmDialogComponent, {
      disableClose: true,
      panelClass: 'custom-modalbox',
      data: {
        title: 'Вы действительно хотите удалить эквайер?',
        successButtonText: 'Да',
        cancelButtonText: 'Нет'
      },
      maxWidth: '30vw'
    })
      .afterClosed()
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => {
        if (res) {
          this.loading = true;
          this.service.deleteCompanyAcquirer(companyAcquirerId)
            .pipe(takeUntil(this.destroyed$))
            .subscribe(res => {
              this.loading = false;
              this.messageService.add({
                severity: res.status ? ToastEnum.SUCCESS : ToastEnum.ERROR,
                summary: res.message
              });
              this.getCompanyAcquirers()
            })
        }
      });

  }

  private getCompanyAcquirers(params = this.queryParams): void {
    this.loading = true;
    this.service.getCompanyAcquirers(this.companyId, params)
      .pipe(
        finalize(() => this.loading = false),
        takeUntil(this.destroyed$)
      )
      .subscribe(res => {
        this.companyAcquirers = res.data;
        this.paginate = res.meta.pagination;
      })
  }

  syncStatus(companyId: string): void {
    this.loading = true;
    this.service.syncCompanyAcquirer({ id: companyId })
      .pipe(
        finalize(() => this.loading = false),
        takeUntil(this.destroyed$)
      )
      .subscribe(res => {
        this.messageService.add({
          severity: res.status ? ToastEnum.SUCCESS : ToastEnum.ERROR,
          summary: res.message
        });
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

  private initData(): void {
    this.store.getCompanyId()
      .pipe(takeUntil(this.destroyed$))
      .subscribe(companyId => {
        this.companyId = companyId;
        if (this.companyId) {
          this.getTabItems();
        }
      })
  }

  private getTabItems(): void {
    this.store.getBankAcquirer()
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => {
        this.tabMenuItems = res ? MerchantConstants.getHeaderAcquirerTabs(this.companyId) : MerchantConstants.getHeaderTabs(this.companyId);
        this.actions = CompanyAcquirerConstants.getAction(this.companyId);
      });
  }

  private addCompanyAcquirer(): void {
    const dialogExist = this.dialog.getDialogById('company-acquirer-dialog');
    if (dialogExist) return;
    const dialogRef = this.dialog.open(CompanyAcquirerCreateDialogComponent, {
      disableClose: true,
      panelClass: 'custom-modalbox',
      id: 'account-dialog',
      data: {companyId: this.companyId, path: 'new'},
    });
    dialogRef.afterClosed()
      .pipe(takeUntil(this.destroyed$))
      .subscribe(result => {
        this.store.setDialog(null);
        if (result) {
          this.getCompanyAcquirers();
        }
      });
  }
}
