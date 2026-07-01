import { AfterViewInit, Component, inject, OnInit, signal, viewChild } from '@angular/core';
import { TableComponent } from '@shared/components/table/table.component';
import { ICaption } from '@core/interfaces/table.interface';
import { ActivatedRoute, Params } from '@angular/router';
import { finalize, takeUntil } from 'rxjs';
import { DestroyableComponent } from '@core/abstract/destroyable.component';
import { IPaginate } from '@eskhata/util';
import { IFilterParams } from '@core/interfaces/filter-params.interface';
import { parseFilterParams } from '@core/utils/filter-util';
import { setDefaultFilterValue } from '@core/utils/route-param-parse';
import { IMerchantBalance } from '@modules/register/merchant-balance/interfaces/merchant-balance.interface';
import { SingleQrService } from '@modules/register/single-qr/services/single-qr.service';
import { SingleQrConstants } from "@modules/register/single-qr/single-qr.constants";
import { ITab } from "@core/interfaces/header.interface";
import { EMPaginationComponent } from "@shared/components/em-pagination/pagination.component";
import { EmHeaderComponent } from "@shared/components/em-header/em-header.component";
import { isEmptyObject } from "@core/utils";

@Component({
  standalone: true,
  selector: 'em-single-qr',
  templateUrl: './single-qr.component.html',
  styleUrls: ['./single-qr.component.scss'],
  imports: [TableComponent, EMPaginationComponent, EmHeaderComponent],
  providers: [SingleQrService]
})
export class SingleQrComponent extends DestroyableComponent implements AfterViewInit, OnInit {
  readonly table = viewChild(TableComponent);
  loading = signal(false);
  singleQr: IMerchantBalance[];
  columns = SingleQrConstants.SINGLE_QR_COLUMNS;
  tabMenuItems: ITab[] = SingleQrConstants.HEADER_TABS;
  paginate: IPaginate | any;
  captionKey = 'single-qr-cols';
  params: Params = {};
  fileStorageUrl: string;
  fileStorageToken: string;

  private readonly service = inject(SingleQrService);
  private readonly route = inject(ActivatedRoute);
  private filterParams: IFilterParams = {
    page: this.route.snapshot.queryParams['Page'] || 1,
    sorts: '',
    pageSize: 15
  };

  ngOnInit(): void {
    this.initRouteParams();
  }

  ngAfterViewInit(): void {
    this.columns.map((x: any, i: any,) => ({
      key: x,
      index: i,
      isSelected: true
    } as ICaption));
    this.table().render(this.columns, this.singleQr);
  }

  sortTable(value: string): void {
    this.filterParams.sorts = value;
    this.getSingleQr()
  }

  private initRouteParams(): void {
    this.route.queryParams
      .pipe(takeUntil(this.destroyed$))
      .subscribe((res: Params) => {
        if (!isEmptyObject(res)) {
          this.filterParams = setDefaultFilterValue(res, this.captionKey);
          const params = parseFilterParams(res, this.filterParams, this.columns);
          this.getSingleQr(params);
        }
      })
  }

  private getSingleQr(params = this.filterParams): void {
    this.loading.set(true);
    this.service.getSingleQr(params)
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntil(this.destroyed$)
      )
      .subscribe(res => {
        if (res.status) {
          this.singleQr = res.data;
          this.fileStorageUrl = res.meta.fileStorageUrl;
          this.fileStorageToken = res.meta.fileStorageToken;
          this.paginate = res.meta.pagination;
        }
      })
  }
}
