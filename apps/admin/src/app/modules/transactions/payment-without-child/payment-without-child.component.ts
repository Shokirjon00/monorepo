import { AfterViewInit, Component, inject, OnInit, viewChild } from '@angular/core';
import { ActionsComponent, EmHeaderComponent, EMPaginationComponent, TableComponent, ToastComponent } from '@eskhata/ui';
import { PaymentsService } from '@modules/transactions/services/payments.service';
import { IPaymentChild } from '@modules/transactions/payments/interfaces';
import { IAction } from '@eskhata/util';
import { ICaption, IFilterParams, IPaginate, IParam } from '@core/interfaces';
import { takeUntil } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { parseFilterParams } from '@core/utils/filter-util';
import { setDefaultFilterValue } from '@eskhata/util';
import { isEmptyObject } from '@core/utils/is-empty-object';
import { Params, Router } from '@angular/router';
import { ITab } from '@eskhata/util';
import { PaymentsWithoutConstants } from '@modules/transactions/payment-without-child/payment-without-child.constants';
import { AbstractPaymentComponent } from '@modules/transactions/abstract/payment.abstract';
import {
  PaymentWithoutChildService
} from '@modules/transactions/payment-without-child/service/payment-without-child.service';
import { DataSourceService } from '@eskhata/data-access';

@Component({
  standalone: true,
  selector: 'em-payment-without-child',
  templateUrl: './payment-without-child.component.html',
  styleUrls: ['./payment-without-child.component.scss'],
  imports: [
    TableComponent,
    ToastComponent,
    ActionsComponent,
    EmHeaderComponent,
    EMPaginationComponent
  ],
  providers: [PaymentWithoutChildService, PaymentsService, DataSourceService]
})
export class PaymentWithoutChildComponent extends AbstractPaymentComponent<any> implements OnInit, AfterViewInit {
  readonly table = viewChild(TableComponent);
  dataSource: IPaymentChild[];
  actions: IAction[] = PaymentsWithoutConstants.PAYMENT_WITHOUT_ACTIONS;
  captions = PaymentsWithoutConstants.PAYMENT_WITHOUT_CHILD_COLUMNS;
  captionKey: string = 'payment-without-child'
  paginate: IPaginate | any;
  params: IParam = {};
  paymentIds: string[];
  tabMenuItems: ITab[] = PaymentsWithoutConstants.HEADER_TABS;
  private readonly router = inject(Router);

  protected readonly columns: any = PaymentsWithoutConstants.PAYMENT_WITHOUT_CHILD_COLUMNS;
  private queryParams: IFilterParams = {
    filters: '',
    page: this.route.snapshot.queryParams['Page'] || 1,
    sorts: '',
    pageSize: 15
  };

  constructor(
    private readonly paymentWithoutChildService: PaymentWithoutChildService,
    paymentsService: PaymentsService,
  ) {
    super(paymentsService);
  }

  ngOnInit(): void {
    this.route.queryParams
      .pipe(takeUntil(this.destroyed$))
      .subscribe((res: Params) => {
        if (!isEmptyObject(res)) {
          this.params = res;
          this.queryParams = setDefaultFilterValue(res, this.captionKey);
          const params = parseFilterParams(res, this.queryParams, this.captions);
          this.getPaymentChildren(params);
        }
      });
  }

  ngAfterViewInit(): void {
    this.captions.map((x: any, i: any,) => ({
      key: x,
      index: i,
      isSelected: true
    } as ICaption));
    this.table().render(this.captions, this.dataSource);
  }

  sortTable(value: string): void {
    this.queryParams.sorts = value;
    this.getPaymentChildren();
  }

  navigateToCompany(dataDetail: { dataSourceId: string, fieldName: string }): void {
    if (dataDetail.fieldName === 'companyName') {
      const companyId = this.dataSource.find(item => item.id === dataDetail.dataSourceId).companyId;
      this.router.navigate(['clients/company', companyId]).catch();
    }
  }

  checkedTableItems(paymentIds: string[]): void {
    this.paymentIds = paymentIds.slice();
    this.selectedItemsExist = this.paymentIds.length > 0;
  }

  private getPaymentChildren(params = this.queryParams): void {
    this.loading.set(true);
    this.paymentWithoutChildService.getPaymentsItems(params)
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntil(this.destroyed$)
      )
      .subscribe(res => {
        if (res.status) {
          this.dataSource = res.data;
          this.paginate = res.meta.pagination;
        }
      })
  }
}
