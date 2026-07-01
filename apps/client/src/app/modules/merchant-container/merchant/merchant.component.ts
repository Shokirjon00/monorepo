import { AfterViewInit, Component, DestroyRef, inject, OnInit, viewChild } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { TableComponent } from '@shared/components/table/table.component';
import { IMerchant } from '@modules/merchant-container/merchant/interfaces/merchant.interface';
import { MerchantService } from '@modules/merchant-container/merchant/services/merchant.service';
import { IPaginate } from '@eskhata/util';
import { HeaderService } from '@core/services/header.service';
import { ToastEnum } from '@eskhata/util';
import { MessageService } from '@core/services/message.service';
import { isPhone } from '@core/helper';
import { NgxPermissionsModule } from 'ngx-permissions';
import { SharedModule } from '@shared/shared.module';
import { EskhataBankLoaderComponent } from '@shared/components/eskhata-bank-loader/eskhata-bank-loader.component';
import { AccountService } from '@modules/merchant-container/account/services/account.service';
import { IntegrationService } from '@modules/merchant-container/merchant/services/integration.service';
import { provideNgxMask } from 'ngx-mask';
import { MerchantConstants } from '@modules/merchant-container/merchant/merchant.constants';
import { EmHeaderComponent } from '@shared/components/em-header/em-header.component';
import { ActionsComponent } from '@shared/components/actions/actions.component';
import { EMPaginationComponent } from '@shared/components/em-pagination/pagination.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DateTimePipe } from '@core/pipe/date-time.pipe';
import { TableRendererBase } from '@core/abstract/table-renderer-base';
import { WithQueryParams } from '@core/utils/base-query-params';

@Component({
  standalone: true,
  selector: 'em-merchant',
  templateUrl: './merchant.component.html',
  styleUrls: ['./merchant.component.scss'],
  imports: [
    SharedModule,
    EskhataBankLoaderComponent,
    TableComponent,
    EmHeaderComponent,
    ActionsComponent,
    EMPaginationComponent,
    NgxPermissionsModule,
    DateTimePipe,
  ],
  providers: [MerchantService, AccountService, IntegrationService, provideNgxMask()],
})
export class MerchantComponent extends WithQueryParams(TableRendererBase) implements OnInit, AfterViewInit {
  readonly table = viewChild(TableComponent);
  declare renderTable: TableRendererBase['renderTable'];

  loading = false;
  merchants: IMerchant[];
  paginate: IPaginate | null = null;
  tabMenuItems = MerchantConstants.HEADER_TABS;
  actions = MerchantConstants.MERCHANT_ACTION;
  tableActions = MerchantConstants.TABLE_ACTIONS;
  readonly isMobile = isPhone();

  override captionKey = 'merchant';
  override params: Params = {};
  override columns = MerchantConstants.MERCHANT_COLUMNS;

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly service = inject(MerchantService);
  private readonly messageService = inject(MessageService);
  private readonly headerService = inject(HeaderService);

  constructor() {
    super(
      inject(ActivatedRoute),
      inject(Router),
      inject(DestroyRef)
    );
    this.setQueryParams({
      page: this.route.snapshot.queryParams['Page'] || 1,
      pageSize: 15,
      filters: '',
    });
  }

  ngOnInit(): void {
    this.initQueryParams();
  }

  ngAfterViewInit(): void {
    this.renderTable(this.table(), this.columns, this.merchants);
  }

  override getData(params: any): void {
    this.getMerchants(params);
  }

  private getMerchants(params = this.queryParams): void {
    this.loading = true;
    this.service
      .getMerchants(params)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(res => {
        if (res.status) {
          this.merchants = res.data;
          this.paginate = res.meta.pagination;
        } else {
          this.messageService.add({
            severity: ToastEnum.ERROR,
            summary: res.message,
          });
        }
        this.loading = false;
      });
  }

  showDetail(merchantId: string): void {
    this.headerService.setMerchantId(merchantId);
    this.headerService.setIntegrationStatus(this.merchants.find(item => item.id === merchantId)?.isIntegrated);
    this.router.navigate(['merchant/merchant', merchantId, 'poses']).catch();
  }

  edit(merchantId: string): void {
    this.headerService.setMerchantId(merchantId);
    this.router.navigate(['merchant/merchant', merchantId, 'edit']).catch();
  }

  sortTable(value: string): void {
    this.queryParams['sorts'] = value;
    this.getMerchants();
  }
}
