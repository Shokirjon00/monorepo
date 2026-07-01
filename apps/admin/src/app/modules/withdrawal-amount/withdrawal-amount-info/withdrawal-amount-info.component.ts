import { AfterViewInit, Component, inject, OnInit, signal, viewChild } from '@angular/core';
import { ICaption, IRowAction } from '@core/interfaces/table.interface';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { finalize, takeUntil } from 'rxjs';
import { DestroyableComponent } from '@core/abstract/destroyable.component';
import { TableComponent } from '@shared/components/table/table.component';
import {
  IWithdrawalAmount
} from '@modules/withdrawal-amount/withdrawal-amount-info/interfaces/withdrawal-amount.interface';
import {
  WithdrawalAmountService
} from '@modules/withdrawal-amount/withdrawal-amount-info/services/withdrawal-amount.service';
import { IFilterParams } from '@core/interfaces/filter-params.interface';
import { IPaginate } from '@eskhata/util';
import { parseFilterParams } from '@core/utils/filter-util';
import { HeaderService } from '@core/services/header.service';
import { ITab } from '@core/interfaces/header.interface';
import { setDefaultFilterValue } from '@core/utils/route-param-parse';
import { IAction } from '@shared/components/actions/actions.interface';
import { ConfirmDialogComponent } from '@shared/dialogs/confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { ToastEnum } from '@eskhata/util';
import { MessageService } from '@core/services/message.service';
import {
  WithdrawalAmountMerchantService
} from '@modules/withdrawal-amount/withdrawal-amount-info/services/withdrawal-amount-merchant.service';
import { CompanyService } from '@modules/client/company/services/company.service';
import { MerchantService } from '@modules/client/merchant/services/merchant.service';
import { ActionsComponent } from '@shared/components/actions/actions.component';
import { EmHeaderComponent } from '@shared/components/em-header/em-header.component';
import { EMPaginationComponent } from '@shared/components/em-pagination/pagination.component';
import {
  WithdrawalAmountInfoConstants
} from '@modules/withdrawal-amount/withdrawal-amount-info/withdrawal-amount-info.constants';

@Component({
  standalone: true,
  selector: 'em-withdrawal-amount-info',
  templateUrl: './withdrawal-amount-info.component.html',
  styleUrls: ['./withdrawal-amount-info.component.scss'],
  providers: [
    WithdrawalAmountService,
    WithdrawalAmountMerchantService,
    CompanyService,
    MerchantService
  ],
  imports: [TableComponent, ActionsComponent, EmHeaderComponent, EMPaginationComponent]
})
export class WithdrawalAmountInfoComponent extends DestroyableComponent implements OnInit, AfterViewInit {
  readonly table = viewChild(TableComponent);
  withdrawalAmounts: IWithdrawalAmount[];
  loading = signal(false);
  tabMenuItems: ITab[] = WithdrawalAmountInfoConstants.HEADER_TABS;
  actions: IAction[] = WithdrawalAmountInfoConstants.WITHDRAWAL_AMOUNT_INFO_ACTION;
  columns = WithdrawalAmountInfoConstants.WITHDRAWAL_AMOUNT_INFO_COLUMNS;
  tableActions: IRowAction[] = WithdrawalAmountInfoConstants.TABLE_ACTIONS
  captionKey = 'withAmoInfo';

  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(WithdrawalAmountService);
  private readonly store = inject(HeaderService);
  private readonly messageService = inject(MessageService);
  private readonly dialog = inject(MatDialog);
  filterParams: IFilterParams = {
    filters: '',
    page: this.route.snapshot.queryParams['Page'] || 1,
    sorts: '',
    pageSize: 15
  };
  paginate: IPaginate | any;
  params: Params = {};

  ngOnInit(): void {
    this.route.queryParams
      .pipe(takeUntil(this.destroyed$))
      .subscribe((res: Params) => {
        this.params = res;
        this.filterParams = setDefaultFilterValue(res, this.captionKey);
        const params = parseFilterParams(res, this.filterParams, this.columns);
        this.getWithdrawalAmounts(params);
        this.router.navigate([],
          {
            relativeTo: this.route,
            queryParams: this.params
          }).catch();
      });

    this.store.getDialog()
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => {
        if (res === 'issue-money-registries') {
          this.confirmIssueMoneyRegistries();
        }
      });
  }

  confirmIssueMoneyRegistries(): void {
    this.dialog.open(ConfirmDialogComponent, {
      disableClose: true,
      panelClass: 'custom-modalbox',
      maxWidth: 500,
      data: {
        title: 'Вы действительно хотите запустить полный вывод для всех торговых точек?',
        successButtonText: 'Да',
        cancelButtonText: 'Нет'
      },
    })
      .afterClosed()
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => {
        if (res) {
          this.issueMoneyRegistriesAllCompanies();
        }
        this.store.setDialog(null);
      });
  }

  issueMoneyRegistriesAllCompanies(): void {
    this.loading.set(true);
    this.service.allCompanyIssueMoneyRegistries()
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntil(this.destroyed$)
      )
      .subscribe(res => res && this.messageService.add({
        severity: res.status ? ToastEnum.SUCCESS : ToastEnum.ERROR,
        summary: res.message
      }));
  }

  ngAfterViewInit(): void {
    this.columns.map((x: any, i: any,) => ({
      key: x,
      index: i,
      isSelected: true
    } as ICaption));
    this.table().render(this.columns, this.withdrawalAmounts);
  }

  showDetail(withdrawalAmountId: string): void {
    this.router.navigate(['withdrawal-amount/info/detail/', withdrawalAmountId]).catch();
  }

  link(dataDetail: { dataSourceId: string, fieldName: string }): void {
    if (dataDetail.fieldName === 'companyName') {
      const companyId = this.withdrawalAmounts.find(item => item.id === dataDetail.dataSourceId).companyId;
      this.router.navigate(['clients/company', companyId]).catch();
    }
  }

  sortTable(value: string): void {
    this.filterParams.sorts = value;
    this.getWithdrawalAmounts()
  }

  private getWithdrawalAmounts(params = this.filterParams): void {
    this.loading.set(true);
    this.service.getWithdrawalAmounts(params)
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntil(this.destroyed$)
      )
      .subscribe(res => {
        if (res.status) {
          this.withdrawalAmounts = res.data;
          this.paginate = res.meta.pagination;
        }
      })
  }

}
