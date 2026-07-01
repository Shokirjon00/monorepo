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
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { TableComponent } from '@shared/components/table/table.component';
import { ToastComponent } from '@shared/components/toast/toast.component';
import { EmHeaderComponent } from '@shared/components/em-header/em-header.component';
import { EMPaginationComponent } from '@shared/components/em-pagination/pagination.component';
import { EskhataBankLoaderComponent } from '@shared/components/eskhata-bank-loader/eskhata-bank-loader.component';
import { ActionsComponent } from '@shared/components/actions/actions.component';

import {
  MERCHANT_ACTION,
  MERCHANT_HISTORIES_COLUMNS
} from '@modules/merchant-container/merchant-histories/merchant-history-histories.columns';
import { IMerchantHistory } from '@modules/merchant-container/merchant-histories/interfaces/company-registration-history.interfaces';
import { MerchantApplicationService } from '@modules/merchant-container/merchant-histories/services/company-registration.service';
import { MerchantConstants } from '@modules/merchant-container/merchant/merchant.constants';

import { NgxPermissionsModule } from 'ngx-permissions';
import { DateTimePipe } from '@core/pipe/date-time.pipe';
import { IPaginate } from '@eskhata/util';
import { IFilterParams } from '@core/interfaces';

import { isPhone } from '@core/helper';
import { TableRendererBase } from '@core/abstract/table-renderer-base';
import { WithQueryParams } from '@core/utils/base-query-params';

@Component({
  standalone: true,
  selector: 'em-merchant-history-histories',
  templateUrl: './merchant-history-histories.component.html',
  styleUrls: ['./merchant-history-histories.component.scss'],
  imports: [
    TableComponent,
    ToastComponent,
    EmHeaderComponent,
    EMPaginationComponent,
    EskhataBankLoaderComponent,
    NgxPermissionsModule,
    DateTimePipe,
    ActionsComponent,
  ],
  providers: [MerchantApplicationService],
})
export class MerchantHistoryHistoriesComponent extends WithQueryParams(TableRendererBase) implements OnInit, AfterViewInit{
  readonly table = viewChild(TableComponent);

  declare renderTable: TableRendererBase['renderTable'];

  loading = signal(false);
  listRegistrationHistory: IMerchantHistory[];

  override captionKey = 'merchant-application';
  override columns = MERCHANT_HISTORIES_COLUMNS;
  override params: Params = {};

  readonly route = inject(ActivatedRoute);
  readonly router = inject(Router);
  readonly destroyRef = inject(DestroyRef);

  override queryParams: IFilterParams = {
    filters: '',
    page: this.route.snapshot.queryParams['Page'] || 1,
    pageSize: 15,
  };

  actions = MERCHANT_ACTION;
  tabMenuItems = MerchantConstants.HEADER_TABS;
  paginate: IPaginate;
  readonly isMobile = isPhone();
  private readonly service = inject(MerchantApplicationService);

  constructor() {
    super(
      inject(ActivatedRoute),
      inject(Router),
      inject(DestroyRef)
    );
  }

  ngOnInit(): void {
    this.initQueryParams();
  }

  override getData(params: any): void {
    this.getMerchantApplication(params);
  }

  ngAfterViewInit(): void {
    this.renderTable(this.table(), this.columns, this.listRegistrationHistory);
  }

  private getMerchantApplication(params = this.queryParams): void {
    this.loading.set(true);

    this.service
      .getMerchantHistories(params)
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(res => {
        if (res.status) {
          this.listRegistrationHistory = res.data;
          this.paginate = res.meta.pagination;
        }
      });
  }
}
