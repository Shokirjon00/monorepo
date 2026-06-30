import { AfterViewInit, Component, DestroyRef, inject, OnInit, viewChild } from '@angular/core';
import { TableComponent } from "@shared/components/table/table.component";
import { IMenu } from "@modules/food/menu/interfaces/menus.interface";
import { ICaption, IFilterParams, IPaginate } from "@core/interfaces";
import { ActivatedRoute, Params, Router, RouterLink } from "@angular/router";
import { isPhone } from "@core/helper";
import { MessageService } from "@core/services/message.service";
import { restoreQueryParamsIfEmpty } from "@core/utils/restore-query-params";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { parseFilterParams } from "@core/utils/filter-util";
import { IHttpResponse } from "@core/interfaces/http-response.interface";
import { ToastEnum } from "@core/enums/toast-enum";
import { ProductApplicationConstants } from "@modules/food/menu/product-applications/product-application.constants";
import { ProductApplicationsService } from "@modules/food/menu/services/product-application.service";
import { DatePipe } from "@angular/common";
import { EMPaginationComponent } from "@shared/components/em-pagination/pagination.component";
import { EmHeaderComponent } from "@shared/components/em-header/em-header.component";
import { EskhataBankLoaderComponent } from "@shared/components/eskhata-bank-loader/eskhata-bank-loader.component";
import { NgxPermissionsModule } from "ngx-permissions";
import { ActionsComponent } from "@shared/components/actions/actions.component";
import { distinctUntilChanged } from "rxjs/operators";
import { combineLatest } from "rxjs";
import { DataSourceService } from "@core/services/data-source.service";

@Component({
  standalone: true,
  selector: 'em-products',
  templateUrl: './product-applications.component.html',
  styleUrl: './product-applications.component.scss',
  imports: [
    DatePipe,
    EMPaginationComponent,
    EmHeaderComponent,
    EskhataBankLoaderComponent,
    NgxPermissionsModule,
    TableComponent,
    ActionsComponent,
    RouterLink
  ],
  providers: [
    ProductApplicationsService,
    DataSourceService
  ],
})
export class ProductApplicationsComponent implements OnInit, AfterViewInit {
  readonly table = viewChild(TableComponent);
  loading: boolean;
  menus: IMenu[];
  paginate: IPaginate | any;
  params: Params = {};
  captionKey = 'product-application';
  showScrollButton: boolean = false;

  readonly isMobile = isPhone();
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly messageService = inject(MessageService);
  private readonly service = inject(ProductApplicationsService);
  private readonly queryParams: IFilterParams = {
    filter: '',
    page: this.route.snapshot.queryParams['page'] || 1,
    pageSize: 15
  };

  tabMenuItems = ProductApplicationConstants.HEADER_TABS;
  actions = ProductApplicationConstants.ACTION;
  captions = ProductApplicationConstants.PRODUCT_COLUMNS;
  options = ProductApplicationConstants.OPTION_ACTIONS;


  ngOnInit(): void {

    combineLatest([
      this.route.paramMap,
      this.route.queryParams.pipe(
        distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr))
      )
    ])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(([params, query]) => {
        restoreQueryParamsIfEmpty(this.captionKey, this.route, this.router);
        const typeUrl = params.get('type');

        this.params = {...query};
        this.queryParams.page = this.params['page'] ?? 1;
        this.queryParams.pageSize = this.params['pageSize'] ?? 15;

        this.params['ProductApplicationStatus'] = typeUrl === 'in-review' ? 'IN_PROCESS' : 'REJECTED';

        this.queryParams.filter = parseFilterParams(this.params, this.queryParams, this.captions).filters;

        if (this.params['module'] && this.captionKey !== this.params['module']) {
          this.queryParams.page = 1;
        } else {
          this.queryParams.module = this.captionKey;
        }

        delete this.queryParams.filters;

        this.getProductApplications();
      });
  }

  ngAfterViewInit(): void {
    this.captions.map((x: any, i: any,) => ({
      key: x,
      index: i,
      isSelected: true
    } as ICaption))
    this.table().render(this.captions, this.menus)
  }

  sortTable(value: string): void {
    let field = value.includes('.') ? value.split('.')[0] : value;
    this.queryParams.orderBy = value.startsWith('-') ? field.replace('-', '') : `${field} desc`;
    this.getProductApplications();
  }

  onEdit(product: IMenu): void {
    this.router.navigate(['food', 'food-menu', 'edit', product.id]).catch();
  }

  private getProductApplications(params = this.queryParams): void {
    this.loading = true;
    this.service.getProductApplicationList(params)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res: IHttpResponse<IMenu[]>) => {
        if (res.status) {
          this.menus = res.data;
          this.paginate = res.meta.pagination;
        } else {
          this.messageService.add({severity: ToastEnum.ERROR, summary: res.message})
        }
        this.loading = false;
      })
  }
}
