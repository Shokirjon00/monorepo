import { AfterViewInit, Component, inject, OnInit, signal, viewChild } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { BalanceLimitService } from '@modules/balance-limit/services/balance-limit.service';
import { DestroyableComponent } from '@core/abstract/destroyable.component';
import { finalize, takeUntil } from 'rxjs';
import { ITab } from '@core/interfaces/header.interface';
import { CommonModule, Location } from '@angular/common';
import { ToastEnum } from '@core/enums/toast-enum';
import { MessageService } from '@core/services/message.service';
import { IBalanceLimitIFT } from '@modules/balance-limit/Interfaces/balance-limit-ift.interface';
import { IBalanceLimitIftHistory } from '@modules/balance-limit/Interfaces/balance-limit-ift-history';
import { ICaption } from '@core/interfaces/table.interface';
import { IPaginate } from '@core/interfaces/paginate.interface';
import { IFilterParams } from '@core/interfaces/filter-params.interface';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { TableComponent } from '@shared/components/table/table.component';
import { CaptionService } from '@core/services/caption.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '@shared/dialogs/confirm-dialog/confirm-dialog.component';
import { DateTimePipe } from '@core/pipe/date-time.pipe';
import { ValidatorComponent } from '@shared/components/validator/validator.component';
import { SvgIconComponent } from 'angular-svg-icon';
import { EbLoaderComponent } from '@shared/components/eb-loader/eb-loader.component';
import { ToastComponent } from '@shared/components/toast/toast.component';
import { JobLogService } from '@modules/job-log/services/job-log.service';
import { BalanceLimitIftConstants } from '@modules/balance-limit/balance-limit-ift/balance-limit-ift.constants';
import { EmHeaderComponent } from '@shared/components/em-header/em-header.component';
import { EMPaginationComponent } from '@shared/components/em-pagination/pagination.component';
import { BalanceLimitConstants } from "@modules/balance-limit/balance-limit.constants";
import { NgxPermissionsModule } from "ngx-permissions";

@Component({
  standalone: true,
  selector: 'em-balance-limit-ift',
  templateUrl: './balance-limit-ift.component.html',
  styleUrls: ['./balance-limit-ift.component.scss'],
  imports: [
    CommonModule,
    DateTimePipe,
    ValidatorComponent,
    SvgIconComponent,
    ReactiveFormsModule,
    TableComponent,
    EbLoaderComponent,
    ToastComponent,
    EmHeaderComponent,
    EMPaginationComponent,
    NgxPermissionsModule
  ],
  providers: [BalanceLimitService, JobLogService, CaptionService]
})
export class BalanceLimitIftComponent extends DestroyableComponent implements OnInit, AfterViewInit {
  readonly table = viewChild(TableComponent);
  amountFormControl = new FormControl();
  tabMenuItems: ITab[] = BalanceLimitConstants.HEADER_TABS
  columns = BalanceLimitIftConstants.BALANCE_LIMIT_IFT_COLUMNS;
  iftLimit: IBalanceLimitIFT;
  iftLimitHistory: IBalanceLimitIftHistory[];
  loading = signal(false);
  historyLoading: boolean = false;
  captionKey = 'balance-limit-ift';
  paginate: IPaginate | any;
  params: Params = {};

  private readonly service = inject(BalanceLimitService);
  private readonly location = inject(Location);
  private readonly jobLogService = inject(JobLogService);
  private readonly messageService = inject(MessageService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);

  private queryParams: IFilterParams = {
    page: this.route.snapshot.queryParams['Page'] || 1,
    sorts: '',
    pageSize: 15
  };

  constructor() {
    super();
    this.getIftLimit();
  }

  ngOnInit(): void {
    this.route.queryParams
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => {
        this.params = res;
        this.queryParams.page = res['page']
        this.queryParams.pageSize = res['pageSize']
        if (this.params['module'] && this.captionKey !== this.params['module']) {
          this.queryParams.page = 1
        }
        this.getIftHistoryList(this.params);
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
    this.table().render(this.columns, this.iftLimitHistory);
  }

  sortTable(value: string): void {
    this.queryParams.sorts = value;
    this.getIftHistoryList();
  }

  getIftLimit(): void {
    this.loading.set(true);
    this.service.getIftLimit()
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntil(this.destroyed$)
      )
      .subscribe(res => this.iftLimit = res.data);
  }

  confirmAction(accountNumber: string): void {
    if (!this.amountFormControl.value) {
      this.messageService.add({ severity: ToastEnum.ERROR, summary: 'Неправильно заполнены данные!' });
      return null;
    }
    this.dialog.open(ConfirmDialogComponent, {
      disableClose: true,
      panelClass: 'custom-modalbox',
      data: {
        title: `Вы действительно хотите установить значение лимита ${this.amountFormControl.value} c ?`,
        successButtonText: 'Да',
        cancelButtonText: 'Нет'
      },
      maxWidth: '90vw'
    })
      .afterClosed()
      .subscribe(res => res && this.onSubmit(accountNumber));
  }

  onSubmit(accountNumber: string): void {
    this.loading.set(true);
    this.service.updateIftLimit({ accountNumber: accountNumber, amount: this.amountFormControl.value })
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => {
        if (res.status) {
          this.amountFormControl.reset();
          this.checkJobLog(res.data.jobLogId);
        } else {
          this.loading.set(false);
          const msg = (res.errors && res.errors.amount && res.errors.amount[0]) || res.message;
          this.messageService.add({ severity: ToastEnum.ERROR, summary: msg });
        }
      })
  }

  refreshIftLimit(accountNumber: string): void {
    this.loading.set(true);
    this.service.refreshIftLimit({ account: accountNumber })
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => {
        this.checkJobLog(res.data.jobLogId);
        this.messageService.add({ severity: res.status ? ToastEnum.SUCCESS : ToastEnum.ERROR, summary: res.message });
      });
  }

  back(): void {
    this.location.back();
  }

  private checkJobLog(jobLogId: string): void {
    this.jobLogService.check(jobLogId)
      .pipe(takeUntil(this.destroyed$))
      .subscribe((res: any) => {
        if (!res.status) {
          this.messageService.add({ severity: ToastEnum.ERROR, summary: res.message });
          this.loading.set(false);
        } else {
          if (res.data.status === 0 && res.data.allowedTryCount >= 0) {
            return this.setTimeout(() => this.checkJobLog(jobLogId), 2000);
          } else if (res.data.status === 1) {
            this.iftLimit = res.data.response;
            this.messageService.add({ severity: ToastEnum.SUCCESS, summary: res.message || 'Успешно !' });
            this.getIftHistoryList();
            this.loading.set(false);
          }
        }
      });
  }

  private getIftHistoryList(params = this.queryParams): void {
    this.historyLoading = true;
    this.service.getIftHistory(params)
      .pipe(
        finalize(() => this.historyLoading = false),
        takeUntil(this.destroyed$)
      )
      .subscribe(res => {
        if (res.status) {
          this.iftLimitHistory = res.data;
          this.paginate = res.meta.pagination;
        }
      });
  }

}
