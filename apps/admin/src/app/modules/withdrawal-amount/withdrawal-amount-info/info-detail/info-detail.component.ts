import { AfterViewInit, Component, inject, OnInit, viewChild } from '@angular/core';
import { DestroyableComponent } from '@core/abstract/destroyable.component';
import { TableComponent } from '@shared/components/table/table.component';
import { ICaption } from '@core/interfaces/table.interface';
import { finalize, takeUntil } from 'rxjs';
import { ActivatedRoute, Params, Router } from '@angular/router';
import {
  WithdrawalAmountMerchantService
} from '@modules/withdrawal-amount/withdrawal-amount-info/services/withdrawal-amount-merchant.service';
import {
  IWithdrawalAmountMerchants
} from '@modules/withdrawal-amount/withdrawal-amount-info/interfaces/withdrawal-amount-merchants.interface';
import { IHeader } from '@core/interfaces/header.interface';
import { HeaderService } from '@core/services/header.service';
import { IPaginate } from '@eskhata/util';
import { IFilterParams } from '@core/interfaces/filter-params.interface';
import { ToastEnum } from '@eskhata/util';
import { MessageService } from '@core/services/message.service';
import { IAction } from '@shared/components/actions/actions.interface';
import { setDefaultFilterValue } from '@core/utils/route-param-parse';
import { parseFilterParams } from '@core/utils/filter-util';
import { EmHeaderComponent } from '@shared/components/em-header/em-header.component';
import { EMPaginationComponent } from '@shared/components/em-pagination/pagination.component';
import {
  InfoDetailConstants
} from '@modules/withdrawal-amount/withdrawal-amount-info/info-detail/info-detail.constants';
import { ActionsComponent } from '@shared/components/actions/actions.component';

@Component({
  standalone: true,
  selector: 'em-info-detail',
  templateUrl: './info-detail.component.html',
  styleUrls: ['./info-detail.component.scss'],
  providers: [WithdrawalAmountMerchantService],
  imports: [TableComponent, EmHeaderComponent, EMPaginationComponent, ActionsComponent]
})
export class InfoDetailComponent extends DestroyableComponent implements OnInit, AfterViewInit {
  readonly table = viewChild(TableComponent);

  withdrawalAmountInfoDetail: IWithdrawalAmountMerchants[];
  loading: boolean;
  columns = InfoDetailConstants.INFO_DETAIL_COLUMNS;
  captionKey = 'issue-info-table';
  header: IHeader = {
    title: 'Информация',
    isFilter: true,
    tabShow: false,
  };

  paginate: IPaginate | any;
  params: Params = {};

  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly store = inject(HeaderService);
  private readonly messageService = inject(MessageService);
  private readonly service = inject(WithdrawalAmountMerchantService);

  filterParams: IFilterParams = {
    page: this.route.snapshot.queryParams['Page'] || 1,
    pageSize: 15
  };
  withAmountId = this.route.snapshot.params['id'];
  actions: IAction[] = InfoDetailConstants.getActions(this.withAmountId);

  ngOnInit(): void {
    this.route.queryParams
      .pipe(takeUntil(this.destroyed$))
      .subscribe((res: Params) => {
        this.params = res;
        this.filterParams = setDefaultFilterValue(res, this.captionKey);
        const params = parseFilterParams(res, this.filterParams, this.columns);
        this.getDetail(params);
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
    this.table().render(this.columns, this.withdrawalAmountInfoDetail);
  }

  sortTable(value: string): void {
    this.filterParams.sorts = value;
    this.getDetail();
  }

  link(dataDetail: { dataSourceId: string, fieldName: string }): void {
    if (dataDetail.fieldName === 'companyName') {
      const companyId = this.withdrawalAmountInfoDetail.find(item => item.id === dataDetail.dataSourceId).companyId;
      this.router.navigate(['clients/company', companyId]).catch();
    }
  }

  private getDetail(params = this.filterParams): void {
    this.loading = true;
    this.service.getWithdrawalAmountMerchants(this.withAmountId, params)
      .pipe(
        finalize(() => this.loading = false),
        takeUntil(this.destroyed$))
      .subscribe(res => {
        if (res.status) {
          this.withdrawalAmountInfoDetail = res.data;
          this.paginate = res.meta.pagination;
          this.store.setPage(this.paginate);
        } else {
          this.messageService.add({severity: ToastEnum.ERROR, summary: res.message});
        }
      })
  }
}
