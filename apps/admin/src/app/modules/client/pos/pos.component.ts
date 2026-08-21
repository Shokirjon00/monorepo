import { AfterViewInit, Component, inject, OnInit, viewChild } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Subscription, takeUntil } from 'rxjs';
import { ActionsComponent, EmHeaderComponent, EMPaginationComponent, TableComponent, ToastComponent } from '@eskhata/ui';
import { ICaption, IRowAction } from '@eskhata/util';
import { PosService } from '@modules/client/pos/services/pos.service';
import { DestroyableComponent } from '@eskhata/util';
import { IPos } from '@modules/client/pos/interfaces/pos.interface';
import { IFilterParams } from '@eskhata/util';
import { IMerchantDetail } from '@modules/client/merchant/interfaces/merchant-detail.interface';
import { IPaginate } from '@eskhata/util';
import { HeaderService } from '@core/services/header.service';
import { parseFilterParams } from '@core/utils/filter-util';
import { setDefaultFilterValue } from '@eskhata/util';
import { NgxPermissionsService } from 'ngx-permissions';

import { ITab } from '@eskhata/util';
import { PosConstants } from "@modules/client/pos/pos.constants";
import { IAction } from '@eskhata/util';
import { ClientConstants } from "@modules/client/client.constants";

@Component({
  standalone: true,
  selector: 'em-pos',
  templateUrl: './pos.component.html',
  styleUrls: ['./pos.component.scss'],
  providers: [PosService],
  imports: [
    TableComponent,
    ToastComponent,
    ActionsComponent,
    EMPaginationComponent,
    EmHeaderComponent
]
})
export class PosComponent extends DestroyableComponent implements OnInit, AfterViewInit {
  readonly table = viewChild(TableComponent);
  showBreadcrumbs = false;
  showFilters = true;
  merchantId: string;
  companyId: string;
  merchantDetail: IMerchantDetail;
  loading = true;
  posses: IPos[];
  captionKey = 'pos';
  tableActions: IRowAction[] = PosConstants.TABLE_ACTIONS
  columns = PosConstants.POS_COLUMNS;
  tabMenuItems: ITab[];
  actions: IAction[];
  paginate: IPaginate | any;
  params: Params = {};

  private router = inject(Router);
  private service = inject(PosService);
  private permissionService = inject(NgxPermissionsService);
  private store = inject(HeaderService);
  private route = inject(ActivatedRoute);

  private posRoute: string = this.route.snapshot.parent.parent.params['merchantId'];
  private posSub: Subscription;
  private queryParams: IFilterParams = {
    page: this.route.snapshot.queryParams['Page'] || 1,
    sorts: '',
    pageSize: 15
  };

  constructor() {
    super();
    this.getIds();
    this.removeIds();
    this.initTabData();
  }

  ngOnInit(): void {
    this.route.queryParams
      .pipe(takeUntil(this.destroyed$))
      .subscribe((res: Params) => {
        this.params = res;
        this.queryParams = setDefaultFilterValue(res, this.captionKey);
        const params = parseFilterParams(res, this.queryParams, this.columns);
        if (this.merchantId) {
          this.queryParams.filters = `merchantId==${this.merchantId}`;
        }
        this.getPoses(params);
        if (this.merchantId) {
          this.changePage();
        }
        this.router.navigate([],
          {
            relativeTo: this.route,
            queryParams: this.params
          }).catch();
      });
  }

  ngAfterViewInit(): void {
    this.columns.map((x: any, i: any,) => ({
      key: x,
      index: i,
      isSelected: true
    } as ICaption));
    this.table().render(this.columns, this.posses);
  }

  sortTable(value: string): void {
    this.queryParams.sorts = value;
    this.getPoses();
  }

  edit(posId: string): void {
    this.store.setPosId(posId);
    if (this.companyId) {
      this.router.navigate(['clients/company', this.companyId, 'merchant', this.merchantId, 'poses', posId, 'edit']).catch();
    } else if (this.merchantId) {
      this.router.navigate(['clients/merchant', this.merchantId, 'poses', posId, 'edit']).catch();
    } else {
      this.router.navigate(['clients/poses', posId, 'edit']).catch();
    }
  }

  showDetail(posId: string): void {
    if (!this.permissionService.getPermission('PosDetail')) return;
    this.store.setPosId(posId);
    if (this.companyId) {
      this.router.navigate(['clients/company/', this.companyId, 'merchant', this.merchantId, 'poses', posId, 'info']).catch();
    } else if (this.merchantId) {
      this.router.navigate(['clients/merchant', this.merchantId, 'poses', posId, 'info']).catch();
    } else {
      this.router.navigate(['clients/poses', posId, 'info']).catch();
    }
  }

  link(dataDetail: { dataSourceId: string, fieldName: string }): void {
    if (dataDetail.fieldName === 'companyName') {
      const companyId = this.posses.find(item => item.id === dataDetail.dataSourceId).companyId;
      this.router.navigate(['clients/company', companyId]).catch();
    }
  }

  private getPoses(params = this.queryParams): void {
    this.loading = true
    if (this.posSub && !this.posSub.closed) {
      this.posSub.unsubscribe();
    }
    this.posSub = this.service.getPoses(params)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => {
        if (res.status) {
          this.posses = res.data;
          this.paginate = res.meta.pagination;
        }
        this.loading = false;
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

  private removeIds(): void {
    if (!this.posRoute) {
      this.store.setCompanyId(null);
      this.store.setMerchantId(null);
    }
  }

  private getIds(): void {
    this.store.getMerchantId()
      .pipe(takeUntil(this.destroyed$))
      .subscribe(merchantId => this.merchantId = merchantId);

    this.store.getCompanyId()
      .pipe(takeUntil(this.destroyed$))
      .subscribe(companyId => this.companyId = companyId);
  }

  private initTabData(): void {
    if (this.companyId) {
      this.actions = PosConstants.getAction(this.companyId, this.merchantId);
      this.tabMenuItems = PosConstants.getHeaderTabsIds(this.companyId, this.merchantId);
    } else if (this.merchantId) {
      this.tabMenuItems = PosConstants.getPosHeader(this.merchantId);
      this.actions = PosConstants.getActionPos(this.merchantId);
    } else {
      this.tabMenuItems = ClientConstants.HEADERS_TABS
      this.actions = PosConstants.POS_ACTION
    }

    this.route.data.subscribe(data => {
      const fromMerchant = this.route.parent?.snapshot.data['fromMerchant'] ?? false;
      this.showBreadcrumbs = data['fromMerchant'] ?? false;
      this.showFilters = !fromMerchant;
    });
  }
}
