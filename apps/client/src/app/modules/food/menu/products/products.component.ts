import { AfterViewInit, Component, DestroyRef, inject, OnInit, viewChild } from '@angular/core';
import { TableComponent } from "@shared/components/table/table.component";
import { IMenu } from "@modules/food/menu/interfaces/menus.interface";
import { ICaption, IFilterParams, IPaginate } from "@core/interfaces";
import { ActivatedRoute, Params, Router, RouterLink } from "@angular/router";
import { isPhone } from "@core/helper";
import { ProductsService } from "@modules/food/menu/services/product.service";
import { MessageService } from "@core/services/message.service";
import { restoreQueryParamsIfEmpty } from "@core/utils/restore-query-params";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { parseFilterParams } from "@core/utils/filter-util";
import { IHttpResponse } from "@core/interfaces/http-response.interface";
import { ToastEnum } from "@core/enums/toast-enum";
import { ProductConstants } from "@modules/food/menu/products/product.constants";
import { EmHeaderComponent } from "@shared/components/em-header/em-header.component";
import { ActionsComponent } from "@shared/components/actions/actions.component";
import { DatePipe } from "@angular/common";
import { EMPaginationComponent } from "@shared/components/em-pagination/pagination.component";
import { EskhataBankLoaderComponent } from "@shared/components/eskhata-bank-loader/eskhata-bank-loader.component";
import { NgxPermissionsModule } from "ngx-permissions";
import { ConfirmDialogComponent } from "@shared/dialogs/confirm-dialog/confirm-dialog.component";
import { MatDialog } from "@angular/material/dialog";
import { DomSanitizer } from "@angular/platform-browser";
import { finalize } from "rxjs";

@Component({
  selector: 'em-products',
  standalone: true,
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
    ProductsService
  ],
  templateUrl: './products.component.html',
  styleUrl: './products.component.scss'
})
export class ProductsComponent implements OnInit, AfterViewInit {
  readonly table = viewChild(TableComponent);
  loading: boolean;
  menus: IMenu[];
  tabMenuItems = ProductConstants.HEADER_TABS;
  actions = ProductConstants.ACTION;
  captions = ProductConstants.PRODUCT_COLUMNS;
  options = ProductConstants.OPTION_ACTIONS
  paginate: IPaginate | any;
  params: Params = {};
  captionKey = 'products';
  showScrollButton: boolean = false;

  readonly isMobile = isPhone();
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly destroyRef = inject(DestroyRef);
  private readonly route = inject(ActivatedRoute);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly service = inject(ProductsService);
  private readonly messageService = inject(MessageService);
  private readonly queryParams: IFilterParams = {
    filter: '',
    page: this.route.snapshot.queryParams['Page'] || 1,
    pageSize: 15
  };

  ngOnInit(): void {


    this.route.queryParams
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res) => {
        restoreQueryParamsIfEmpty(this.captionKey, this.route, this.router);
        this.params = {...res};
        this.queryParams.page = this.params['page'] ?? 1;
        this.queryParams.pageSize = this.params['pageSize'] ?? 15;

        this.queryParams.filter = parseFilterParams(this.params, this.queryParams, this.captions).filters;
        delete this.queryParams.filters;
        if (this.params['module'] && this.captionKey !== this.params['module']) {
          this.queryParams.page = 1;
        } else {
          this.queryParams.module = this.captionKey;
        }
        this.getProducts();
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
    this.queryParams.orderBy = value.startsWith('-') ? `${field.replace('-', '')} desc` : field;
    this.getProducts();
  }

  onChangeStatus(product: IMenu): void {
    this.dialog.open(ConfirmDialogComponent, {
      disableClose: true,
      panelClass: 'custom-modalbox',
      data: {
        title: this.sanitizer.bypassSecurityTrustHtml(`Вы действительно хотите
                                    <span style="color: #E95B54">Изменить статус</span>
                                    <span style="font-weight: 700">${product.name}</span>?`),
        successButtonText: 'Да',
        cancelButtonText: 'Нет'
      },
      maxWidth: '30vw'
    })
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(res => {
        if (res) {
          product.isActive = !product.isActive;
          this.changeActiveStatus(product.id, product)
        }
      });
  }

  onEdit(product: IMenu): void {
    this.router.navigate(['food', 'food-menu', 'add', product.id]).catch();
  }

  private changeActiveStatus(id: string, product: IMenu): void {
    this.service.changeActiveStatus(id, product)
        .pipe(
            takeUntilDestroyed(this.destroyRef)
        )
        .subscribe(res => {
          this.messageService.add({
            severity: res.status ? ToastEnum.SUCCESS : ToastEnum.ERROR,
            summary: res.status ? 'Успешно' : 'Неуспешно'
          });
          if (res.status) {
            this.getProducts();
          }
        })
  }

  private getProducts(params = this.queryParams): void {
    this.loading = true;
    this.service.getProductList(params)
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
