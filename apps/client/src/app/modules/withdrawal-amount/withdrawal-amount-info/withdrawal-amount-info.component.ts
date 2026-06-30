import { AfterViewInit, Component, DestroyRef, inject, OnInit, signal, viewChild } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatDialog } from '@angular/material/dialog';
import { TableComponent } from '@shared/components/table/table.component';
import { WithdrawalAmountService } from '@modules/withdrawal-amount/withdrawal-amount-info/services/withdrawal-amount.service';
import { WithdrawalAmountInfoConstants } from '@modules/withdrawal-amount/withdrawal-amount-info/withdrawal-amount-info.constants';
import { IFilterParams } from '@core/interfaces/filter-params.interface';
import { IPaginate } from '@core/interfaces/paginate.interface';
import { parseFilterParams } from '@core/utils/filter-util';
import { IAction } from '@shared/components/actions/action.interface';
import { isPhone } from '@core/helper';
import { SharedModule } from '@shared/shared.module';
import { EskhataBankLoaderComponent } from '@shared/components/eskhata-bank-loader/eskhata-bank-loader.component';
import { ActionsComponent } from '@shared/components/actions/actions.component';
import { EMPaginationComponent } from '@shared/components/em-pagination/pagination.component';
import { EmHeaderComponent } from '@shared/components/em-header/em-header.component';
import { ICaption } from '@core/interfaces/table1.interface';
import { restoreQueryParamsIfEmpty } from '@core/utils/restore-query-params';
import { DateTimePipe } from '@core/pipe/date-time.pipe';
import { WithdrawalSelectedCompanyAmountDialogComponent } from '@modules/withdrawal-amount/withdrawal-selected-company-amount-dialog/withdrawal-selected-company-amount-dialog.component';
import { ActionEnum } from '@core/enums/action-enum';
import { IWithdrawalAmount } from '@modules/withdrawal-amount/interfaces/withdrawal-amount.interface';
import { EXPAND_DETAIL } from '@shared/animations';
import { SvgIconComponent } from 'angular-svg-icon';
import { TableConstants } from '@shared/components/table/table.constants';

@Component({
  standalone: true,
  selector: 'em-withdrawal-amount-info',
  templateUrl: './withdrawal-amount-info.component.html',
  styleUrls: ['./withdrawal-amount-info.component.scss'],
  animations: [EXPAND_DETAIL],
  imports: [
    SharedModule,
    EskhataBankLoaderComponent,
    TableComponent,
    ActionsComponent,
    EMPaginationComponent,
    EmHeaderComponent,
    DateTimePipe,
    SvgIconComponent,
  ],
  providers: [WithdrawalAmountService],
})
export class WithdrawalAmountInfoComponent implements OnInit, AfterViewInit {
  readonly table = viewChild(TableComponent);
  withdrawalAmounts: IWithdrawalAmount[] = [];
  check: boolean;
  loading = signal(false);
  columns = WithdrawalAmountInfoConstants.WITHDRAWAL_AMOUNT_INFO_COLUMNS;
  captionKey = 'withdrawalAmountInfoFiltersForm';
  paginate: IPaginate | any;
  params: Params = {};
  actions = signal<IAction[]>([]);
  showScrollButton: boolean = false;
  dictionary = TableConstants.isuStatusClasses;
  readonly isMobile = isPhone();

  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(WithdrawalAmountService);
  private readonly dialog = inject(MatDialog);

  private filterParams: IFilterParams = {
    page: this.route.snapshot.queryParams['Page'] || 1,
    pageSize: 15,
  };

  ngOnInit(): void {
    this.initCheck();
  }

  ngAfterViewInit(): void {
    this.columns.map(
      (x: any, i: any) =>
        ({
          key: x,
          index: i,
          isSelected: true,
        }) as ICaption
    );
    this.table().render(this.columns, this.withdrawalAmounts);
  }

  sortTable(value: string): void {
    this.filterParams.sorts = value;
    this.getWithdrawalAmounts();
  }

  statusIndicator(statusId: string): string {
    return this.dictionary[statusId] || '';
  }

  private initCheck(): void {
    this.loading.set(true);

    this.service
      .check()
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(res => {
        if (res.status && res.data) {
          this.check = true;
          const withdrawalAction = WithdrawalAmountInfoConstants.ACTIONS.find(a => a.code === ActionEnum.WITHDRAWAL);

          if (withdrawalAction) {
            this.actions.set([withdrawalAction]);
          }
        } else {
          this.actions.set([]);
        }
        this.initQueryParams();
      });
  }

  private initQueryParams(): void {
    this.route.queryParams.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(res => {
      restoreQueryParamsIfEmpty(this.captionKey, this.route, this.router);
      this.params = res;
      this.filterParams.page = res['page'];
      this.filterParams.pageSize = res['pageSize'];
      const params = parseFilterParams(res, this.filterParams, this.columns);

      if (this.params['module'] && this.captionKey !== this.params['module']) {
        this.filterParams.page = 1;
      } else {
        this.filterParams.module = this.captionKey;
      }

      this.getWithdrawalAmounts(params);
    });
  }

  withdrawalAmount(): void {
    if (this.dialog.getDialogById('withdrawal-money')) {
      return;
    }

    this.dialog
      .open(WithdrawalSelectedCompanyAmountDialogComponent, {
        disableClose: false,
        panelClass: 'custom-modalbox',
        id: 'withdrawal-money',
      })
      .afterClosed()
      .subscribe();
  }

  private getWithdrawalAmounts(params = this.filterParams): void {
    this.loading.set(true);
    this.service
      .getWithdrawalAmounts(params)
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(res => {
        if (res.status) {
          this.withdrawalAmounts = res.data;
          this.paginate = res.meta.pagination;
        }
      });
  }
}
