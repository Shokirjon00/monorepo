import { combineLatest, finalize, takeUntil } from 'rxjs';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { TableComponent } from '@shared/components/table/table.component';
import { ICaption, IRowAction } from '@core/interfaces/table.interface';
import { DestroyableComponent } from '@core/abstract/destroyable.component';
import { AfterViewInit, Component, inject, OnInit, viewChild } from '@angular/core';
import { IAction } from '@shared/components/actions/actions.interface';
import { IFilterParams } from '@core/interfaces/filter-params.interface';
import { IPaginate } from '@eskhata/util';
import { HeaderService } from '@core/services/header.service';
import { parseFilterParams } from '@core/utils/filter-util';
import { setDefaultFilterValue } from '@core/utils/route-param-parse';
import { MerchantServiceService } from "@modules/client/merchant-service/services/merchant-service.service";
import { IMerchantService } from "@modules/client/merchant-service/interfaces/merchant-service.interface";
import { ToastEnum } from '@eskhata/util';
import { MessageService } from "@core/services/message.service";
import { NgxPermissionsService } from "ngx-permissions";
import { MerchantServiceConstants } from "@modules/client/merchant-service/merchant-service.constants";
import { PosTerminalsConstants } from "@modules/client/pos-terminal/pos-terminals.constants";
import { ITab } from "@core/interfaces/header.interface";
import { ActionsComponent } from "@shared/components/actions/actions.component";
import { EMPaginationComponent } from "@shared/components/em-pagination/pagination.component";
import { EmHeaderComponent } from "@shared/components/em-header/em-header.component";


@Component({
  standalone: true,
  selector: 'em-merchant-services',
  templateUrl: './merchant-service.component.html',
  styleUrls: ['./merchant-service.component.scss'],
  providers: [MerchantServiceService],
  imports: [
    TableComponent,
    ActionsComponent,
    EMPaginationComponent,
    EmHeaderComponent
]
})
export class MerchantServiceComponent extends DestroyableComponent implements OnInit, AfterViewInit {
  readonly table = viewChild(TableComponent);
  loading: boolean;
  posTypeId: string;
  merchantRemoveId: any;
  merchantService: IMerchantService[];
  tabMenuItems: ITab[];
  captions = MerchantServiceConstants.MERCHANT_SERVICE_COLUMNS;
  tableActions: IRowAction[] = MerchantServiceConstants.TABLE_ACTIONS
  actions: IAction[];
  paginate: IPaginate | any;
  captionKey = 'service'
  params: Params = {};

  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private service = inject(MerchantServiceService);
  private headerService = inject(HeaderService);
  private store = inject(HeaderService);
  private messageService = inject(MessageService);
  private permissionService = inject(NgxPermissionsService);
  private queryParams: IFilterParams = {
    page: this.activatedRoute.snapshot.queryParams['Page'] || 1,
    pageSize: 15
  };

  merchantId = this.activatedRoute.snapshot.parent.parent.params['merchantId'];
  companyId = this.activatedRoute.snapshot.parent.parent.params['companyId'];

  constructor() {
    super()
    this.initTabData();
    this.changePage();
  }

  ngOnInit(): void {
    this.activatedRoute.queryParams
      .pipe(takeUntil(this.destroyed$))
      .subscribe((res: Params) => {
        this.params = res;
        this.queryParams = setDefaultFilterValue(res, this.captionKey);
        const params = parseFilterParams(res, this.queryParams, this.captions);
        this.getMerchantService(params);
        this.router.navigate([],
          {
            relativeTo: this.activatedRoute,
            queryParams: this.params
          }).catch();
      });
  }

  ngAfterViewInit(): void {
    this.captions.map((x: any, i: any,) => ({
      key: x,
      index: i,
      isSelected: true
    } as ICaption))
    this.table().render(this.captions, this.merchantService)
  }

  showDetail(serviceId: string): void {
    if (!this.permissionService.getPermission('MerchantServiceDetail')) return;
    this.store.setPosId(serviceId);
    if (this.companyId) {
      this.router.navigate(['/clients/company/', this.companyId, 'merchant', this.merchantId, 'service', serviceId, 'info']).catch();
    } else if (this.merchantId) {
      this.router.navigate(['/clients/merchant', this.merchantId, 'service', serviceId, 'info']).catch()
    }
  }

  edit(serviceId: string): void {
    if (this.companyId) {
      this.router.navigate(['/clients/company', this.companyId, 'merchant', this.merchantId, 'service', serviceId, 'edit']).catch();
    } else if (this.merchantId) {
      this.router.navigate(['/clients/merchant', this.merchantId, 'service', serviceId, 'edit']).catch();
    }
  }

  sortTable(value: string): void {
    this.queryParams.sorts = value;
    this.getMerchantService();
  }

  private getMerchantService(params = this.queryParams): void {
    this.loading = true;
    this.service.getMerchantService(params, this.merchantId)
      .pipe(
        finalize(() => this.loading = false),
        takeUntil(this.destroyed$)
      )
      .subscribe(res => {
        if (res.status) {
          this.merchantService = res.data;
          this.merchantService.forEach(service => {
            this.merchantRemoveId = service.id;
          });

          this.paginate = res.meta?.pagination;
          this.headerService.setPage(this.paginate);
        }
      });
  }

  deleteParameter(event: any): void {
    this.loading = true;
    this.service.remove(this.merchantId, this.merchantRemoveId)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => {
        this.messageService.add({
          severity: res.status ? ToastEnum.SUCCESS : ToastEnum.ERROR,
          summary: res.message
        });
        this.getMerchantService();
      });
  }


  private changePage(): void {
    this.headerService.getPageChange()
      .pipe(takeUntil(this.destroyed$))
      .subscribe(pageChange => {
        if (pageChange) {
          this.queryParams.page = pageChange.pageNumber;
          this.queryParams.pageSize = pageChange.pageSize
          this.getMerchantService()
        }
      });
  }

  private initTabData(): void {
    combineLatest([
      this.store.getCompanyId(),
      this.store.getMerchantId()
    ])
      .pipe(takeUntil(this.destroyed$))
      .subscribe(([companyId, merchantId]) => {
        this.companyId = companyId;
        this.merchantId = merchantId;
        this.getTabItems();
      });
  }


  private getTabItems(): void {
    if (this.companyId) {
      this.tabMenuItems = PosTerminalsConstants.getPosHeaderTabs(this.companyId, this.merchantId)
      this.actions = MerchantServiceConstants.getAction(this.merchantId);
    } else {
      this.tabMenuItems = PosTerminalsConstants.getPosHeader(this.merchantId);
      this.actions = MerchantServiceConstants.getAction(this.merchantId)
    }
  }
}
