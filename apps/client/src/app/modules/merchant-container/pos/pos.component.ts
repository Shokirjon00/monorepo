import { AfterViewInit, Component, inject, OnInit, viewChild } from '@angular/core';
import { ICaption } from '@eskhata/util';
import { ActionsComponent, EmHeaderComponent, EMPaginationComponent, EskhataBankLoaderComponent, TableComponent } from '@eskhata/ui';
import { ActivatedRoute, Params, Router } from "@angular/router";
import { PosService } from "@modules/merchant-container/pos/services/pos.service";
import { IPos } from "@modules/merchant-container/pos/interfaces/pos.interface";
import { takeUntil } from "rxjs";
import { DestroyableComponent } from '@eskhata/util';
import { IFilterParams } from '@eskhata/util';
import { HeaderService } from '@eskhata/data-access';
import { parseFilterParams } from "@core/utils/filter-util";
import { IPaginate } from '@eskhata/util';
import { isPhone } from '@core/helper';
import { NgxPermissionsAllowStubDirective, NgxPermissionsService } from 'ngx-permissions';
import { SharedModule } from "@shared/shared.module";
import { PosConstants } from "@modules/merchant-container/pos/pos.constants";
import { IAction } from '@eskhata/util';
import { ITab } from "@core/interfaces";
import { SvgIconComponent } from "angular-svg-icon";

@Component({
  standalone: true,
  selector: 'em-pos',
  templateUrl: './pos.component.html',
  styleUrls: ['./pos.component.scss'],
  imports: [
    SharedModule,
    NgxPermissionsAllowStubDirective,
    EskhataBankLoaderComponent,
    TableComponent,
    EmHeaderComponent,
    ActionsComponent,
    EMPaginationComponent,
    SvgIconComponent
  ],
  providers: [PosService]
})
export class PosComponent extends DestroyableComponent implements OnInit, AfterViewInit {
  readonly table = viewChild(TableComponent);
  merchantId: string;
  companyId: string;
  loading = true;
  posses: IPos[];
  captionKey = 'pos';
  captions = PosConstants.POS_COLUMNS;
  tableActions = PosConstants.TABLE_ACTIONS
  actions: IAction[];
  tabMenuItems: ITab[];
  paginate: IPaginate | any;
  params: Params = {};
  showScrollButton: boolean = false;
  readonly isMobile = isPhone();

  private readonly router = inject(Router);
  private readonly service = inject(PosService);
  private readonly route = inject(ActivatedRoute);
  private readonly headerService = inject(HeaderService);
  private readonly permissionService = inject(NgxPermissionsService);

  private queryParams: IFilterParams = {
    page: this.route.snapshot.queryParams['Page'] || 1,
    sorts: '',
    pageSize: 15
  };

  constructor() {
    super();
    this.initData()
  }

  ngOnInit(): void {
    this.route.queryParams
      .pipe(takeUntil(this.destroyed$))
      .subscribe((res: any) => {
        this.params = res;
        this.queryParams.page = res['page'];
        this.queryParams.pageSize = res['pageSize'];
        const params = parseFilterParams(res, this.queryParams, this.captions);
        if (this.merchantId) {
          this.queryParams.filters = `merchantId==${this.merchantId}`;
        }
        if (this.params['module'] && this.captionKey !== this.params['module']) {
          this.queryParams.page = 1
        } else {
          this.queryParams.module = this.captionKey;
        }
        if (this.merchantId) {
          this.changePage();
        }
        this.getPoses(params);
        this.router.navigate([],
          {
            relativeTo: this.route,
            queryParams: this.params
          }).catch();
      })
  }

  initData(): void {
    this.getIds();
    this.actions = PosConstants.getAction(this.merchantId)
    this.headerService.getIntegrationStatus()
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => {
        if (!res) {
          this.tabMenuItems = PosConstants.getHeaderTabsIds(this.merchantId);
        } else {
          this.tabMenuItems = PosConstants.getPosHeader(this.merchantId);
        }
      });
  }

  ngAfterViewInit(): void {
    this.captions.map((x: any, i: any,) => ({
      key: x,
      index: i,
      isSelected: true
    } as ICaption))
    this.table().render(this.captions, this.posses)
  }

  edit(posId: string): void {
    this.router.navigate(['merchant/merchant', this.merchantId, 'poses', posId, 'edit']).catch();
  }

  showDetail(posId: string): void {
    if (!this.permissionService.getPermission('PosDetail')) return;
    this.router.navigate(['merchant/merchant', this.merchantId, 'poses', posId, 'info']).catch();
  }

  sortTable(value: string): void {
    this.queryParams.sorts = value;
    this.getPoses();
  }

  back(): void {
    this.router.navigate(['merchant/merchant']).catch();
  }

  private getPoses(params = this.queryParams, scroll: boolean = false): void {
    this.loading = true
    this.service.getPoses(params)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => {
        if (res.status) {
          if (scroll) {
            this.posses = this.posses.concat(res.data);
          } else {
            this.posses = res.data;
          }
          this.paginate = res.meta.pagination;
        }
        this.loading = false;
      });
  }

  private changePage(): void {
    this.headerService.getPageChange()
      .pipe(takeUntil(this.destroyed$))
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

  private getIds(): void {
    this.headerService.getMerchantId()
      .pipe(takeUntil(this.destroyed$))
      .subscribe(merchantId => this.merchantId = merchantId);
  }
}
