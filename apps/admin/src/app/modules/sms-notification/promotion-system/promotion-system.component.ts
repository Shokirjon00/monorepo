import { AfterViewInit, Component, inject, OnInit, signal, viewChild } from '@angular/core';
import { EmHeaderComponent, EMPaginationComponent, TableComponent } from '@eskhata/ui';
import { ICaption, IRowAction } from '@eskhata/util';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { finalize, takeUntil } from 'rxjs';
import { DestroyableComponent } from '@eskhata/util';
import { IPaginate } from '@eskhata/util';
import { IFilterParams } from '@eskhata/util';
import { parseFilterParams } from '@core/utils/filter-util';
import { ITab } from '@eskhata/util';
import { ISMS } from "@modules/sms-notification/promotion-system/interface/sms.interface";
import { SmsService } from "@modules/sms-notification/promotion-system/service/sms.service";
import {
  PromotionSystemConstants
} from "@modules/sms-notification/promotion-system/promotion-system.constants";
import { isEmptyObject, setDefaultFilterValue } from "@core/utils";
import { EbLoaderComponent } from "@shared/components/eb-loader/eb-loader.component";

@Component({
  standalone: true,
  selector: 'em-promotion-system',
  templateUrl: './promotion-system.component.html',
  styleUrls: ['./promotion-system.component.scss'],
  providers: [SmsService],
  imports: [TableComponent, EMPaginationComponent, EmHeaderComponent, EbLoaderComponent]
})
export class PromotionSystemComponent extends DestroyableComponent implements AfterViewInit, OnInit {
  readonly table = viewChild(TableComponent);
  loading = signal(false);
  balanceLimits: ISMS[];
  columns: any = PromotionSystemConstants.PROMOTION_SYSTEM_COLUMNS;
  tableActions: IRowAction[] = PromotionSystemConstants.TABLE_ACTIONS;
  tabMenuItems: ITab[] = PromotionSystemConstants.HEADER_TABS;
  captionKey = 'promotion-system-cols';
  paginate: IPaginate | any;

  private readonly router = inject(Router);
  private readonly service = inject(SmsService);
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
    this.table().render(this.columns, this.balanceLimits);
  }

  detail(detail: string): void {
    this.router.navigate([`promotion-system/list/info`, detail]).catch()
  }

  edit(edit: string): void {
    this.router.navigate([`promotion-system/list/edit`, edit]).catch();
  }

  sortTable(value: string): void {
    this.filterParams.sorts = value;
    this.getSmsNotificationList();
  }

  private getSmsNotificationList(params = this.filterParams): void {
    this.loading.set(true);
    this.service.getSystemNotification(params)
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntil(this.destroyed$)
      )
      .subscribe(res => {
        if (res.status) {
          this.balanceLimits = res.data;
          this.paginate = res.meta.pagination;
        }
      });
  }

  private initRouteParams(): void {
    this.route.queryParams
      .pipe(takeUntil(this.destroyed$))
      .subscribe((res: Params) => {
        if (!isEmptyObject(res)) {
          this.filterParams = setDefaultFilterValue(res, this.captionKey);
          const params = parseFilterParams(res, this.filterParams, this.columns);
          this.getSmsNotificationList(params);
        }
      });
  }
}
