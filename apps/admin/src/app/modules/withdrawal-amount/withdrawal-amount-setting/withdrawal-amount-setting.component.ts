import { AfterViewInit, Component, inject, OnInit, viewChild } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { ICaption, IRowAction } from '@core/interfaces/table.interface';
import { TableComponent } from '@shared/components/table/table.component';
import { finalize, takeUntil } from 'rxjs';
import { DestroyableComponent } from '@core/abstract/destroyable.component';
import {
  WithdrawSetService
} from '@modules/withdrawal-amount/withdrawal-amount-setting/services/withdrawal-amount-setting.service';
import {
  IWithdrawSet
} from '@modules/withdrawal-amount/withdrawal-amount-setting/interfaces/withdrawal-amount-setting.interface';
import { IPaginate } from '@eskhata/util';
import { parseFilterParams } from '@core/utils/filter-util';
import { IFilterParams } from '@core/interfaces/filter-params.interface';
import { IAction } from '@shared/components/actions/actions.interface';
import { ITab } from '@core/interfaces/header.interface';
import { setDefaultFilterValue } from '@core/utils/route-param-parse';
import { EbLoaderComponent } from '@shared/components/eb-loader/eb-loader.component';
import { ActionsComponent } from '@shared/components/actions/actions.component';
import { EmHeaderComponent } from '@shared/components/em-header/em-header.component';
import { EMPaginationComponent } from '@shared/components/em-pagination/pagination.component';
import {
  WithdrawalAmountSettingConstants
} from '@modules/withdrawal-amount/withdrawal-amount-setting/withdrawal-amount-setting.constants';

@Component({
  standalone: true,
  selector: 'em-withdrawal-amount-setting',
  templateUrl: './withdrawal-amount-setting.component.html',
  styleUrls: ['./withdrawal-amount-setting.component.scss'],
  providers: [WithdrawSetService],
  imports: [
    TableComponent,
    EbLoaderComponent,
    ActionsComponent,
    EmHeaderComponent,
    EMPaginationComponent
  ]
})
export class WithdrawalAmountSettingComponent extends DestroyableComponent implements AfterViewInit, OnInit {
  readonly table = viewChild(TableComponent);
  withdrawSet: IWithdrawSet[];
  loading: boolean;
  actions: IAction[] = WithdrawalAmountSettingConstants.WITHDRAWAL_AMOUNT_SETTING_ACTION;
  columns = WithdrawalAmountSettingConstants.WITHDRAWAL_AMOUNT_SETTING_COLUMNS;
  tableActions: IRowAction[] = WithdrawalAmountSettingConstants.TABLE_ACTIONS
  tabMenuItems: ITab[] = WithdrawalAmountSettingConstants.HEADER_TABS;
  captionKey = 'withSetting';
  paginate: IPaginate | any;
  params: Params = {};

  private readonly router = inject(Router);
  private readonly service = inject(WithdrawSetService);
  private readonly route = inject(ActivatedRoute);
  private queryParams: IFilterParams = {
    filters: '',
    page: this.route.snapshot.queryParams['Page'] || 1,
    sorts: '',
    pageSize: 15
  };

  ngOnInit(): void {
    this.route.queryParams
      .pipe(takeUntil(this.destroyed$))
      .subscribe((res: Params) => {
        this.params = res;
        this.queryParams = setDefaultFilterValue(res, this.captionKey);
        const params = parseFilterParams(res, this.queryParams, this.columns);
        this.getWithdrawalAmountSettings(params);
        this.router.navigate([],
          {
            relativeTo: this.route,
            queryParams: this.params
          }).catch();
      })
  }

  ngAfterViewInit(): void {
    this.columns.map((x: any, i: any,) => ({
      key: x,
      index: i,
      isSelected: true
    } as ICaption));
    this.table().render(this.columns, this.withdrawSet)
  }

  showDetail(withAmountSettingId: string): void {
    this.router.navigate(['withdrawal-amount/setting/info', withAmountSettingId])
      .catch()
  }

  edit(withAmountSettingId: string): void {
    this.router.navigate(['withdrawal-amount/setting/edit', withAmountSettingId])
      .catch()
  }

  sortTable(value: string): void {
    this.queryParams.sorts = value;
    this.getWithdrawalAmountSettings()
  }

  link(dataDetail: { dataSourceId: string, fieldName: string }): void {
    if (dataDetail.fieldName === 'companyName') {
      const companyId = this.withdrawSet.find(item => item.id === dataDetail.dataSourceId).companyId;
      this.router.navigate(['clients/company', companyId]).catch();
    }
  }

  private getWithdrawalAmountSettings(params = this.queryParams): void {
    this.loading = true;
    this.service.getWithdrawalAmountSettings(params)
      .pipe(
        finalize(() => this.loading = false),
        takeUntil(this.destroyed$)
      )
      .subscribe(res => {
        if (res.status) {
          this.withdrawSet = res.data;
          this.paginate = res.meta.pagination;
        }
      })
  }
}
