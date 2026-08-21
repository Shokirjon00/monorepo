import { AfterViewInit, Component, inject, OnInit, viewChild } from '@angular/core';
import { ActionsComponent, EmHeaderComponent, EMPaginationComponent, TableComponent, ToastComponent } from '@eskhata/ui';
import { CaptionService } from '@core/services';
import { Params, Router } from '@angular/router';
import { ICaption, IFilterParams, IPaginate, IRowAction } from '@core/interfaces';
import { IParam } from '@eskhata/util';
import { TableRowActionEnum } from '@eskhata/util';
import { PAYMENTCHILD_COLUMNS } from './payment-child.columns';
import { IPaymentChild } from '@modules/transactions/payments/interfaces';
import { IAction } from '@eskhata/util';
import { takeUntil } from 'rxjs';
import { parseFilterParams } from '@core/utils/filter-util';
import { setDefaultFilterValue } from '@eskhata/util';
import { finalize } from 'rxjs/operators';
import { ToastEnum } from '@eskhata/util';
import { ITab } from '@eskhata/util';
import { PaymentsDetailConstants } from '../payment-detail.constants';
import { PaymentsChildConstants } from './payment-child.constants';
import { ConfirmDialogComponent } from '@shared/dialogs/confirm-dialog/confirm-dialog.component';
import { PaymentIssueMoneyDialogComponent } from '../payment-issue-money-dialog/payment-issue-money-dialog.component';
import { AbstractPaymentComponent } from '@modules/transactions/abstract/payment.abstract';
import {
  PaymentChildService
} from '@modules/transactions/payments/payment-detail/payment-child/services/payment-child.service';
import { PaymentsService } from '@modules/transactions/services/payments.service';
import { EbLoaderComponent } from "@shared/components/eb-loader/eb-loader.component";

@Component({
  standalone: true,
  selector: 'em-payment-child',
  templateUrl: './payment-child.component.html',
  styleUrls: ['./payment-child.component.scss'],
  providers: [PaymentChildService, PaymentsService],
  imports: [
    TableComponent,
    ToastComponent,
    ActionsComponent,
    EMPaginationComponent,
    EmHeaderComponent,
    EbLoaderComponent
  ]
})

export class PaymentChildComponent extends AbstractPaymentComponent<any> implements AfterViewInit, OnInit {
  readonly table = viewChild(TableComponent);
  paymentIds: string[];
  paymentChildren: IPaymentChild[];
  tabMenuItems: ITab[];
  captions = PAYMENTCHILD_COLUMNS;
  actions: IAction[] = PaymentsChildConstants.PAYMENT_CHILD_ACTIONS;
  captionKey = 'payment-child'
  tableActions: IRowAction[] = [
    {
      type: TableRowActionEnum.EDIT,
      permissionName: 'PaymentUpdate',
      iconUrl: 'icons/pen.svg',
    }
  ];
  paginate: IPaginate | any;
  params: IParam = {};

  private readonly paymentChildService = inject(PaymentChildService);
  private readonly router = inject(Router);
  private readonly captionService = inject(CaptionService);
  private queryParams: IFilterParams = {
    filters: '',
    page: this.route.snapshot.queryParams['Page'] || 1,
    sorts: '',
    pageSize: 15
  };

  constructor(
    paymentsService: PaymentsService,
  ) {
    super(paymentsService);
    this.tabMenuItems = PaymentsDetailConstants.getHeaderTabs(this.paymentId);
  }

  ngOnInit(): void {
    this.captionService.setCaption(this.captions);
    this.route.queryParams
      .pipe(takeUntil(this.destroyed$))
      .subscribe((res: Params) => {
        this.params = res;
        this.queryParams = setDefaultFilterValue(res, this.captionKey);
        const params = parseFilterParams(res, this.queryParams, this.captions);
        this.getPaymentChildren(params);
      });
  }

  ngAfterViewInit(): void {
    this.captions.map((x: any, i: any,) => ({
      key: x,
      index: i,
      isSelected: true
    } as ICaption))
    this.table().render(this.captions, this.paymentChildren)
  }

  checkedTableItems(paymentIds: string[]): void {
    this.paymentIds = paymentIds.slice();
    this.selectedItemsExist = this.paymentIds.length > 0;
  }

  sortTable(value: string): void {
    this.queryParams.sorts = value;
    this.getPaymentChildren()
  }

  editPayment(id: string): void {
    this.loading.set(true);
    this.service.getPaymentForEdit(id)
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntil(this.destroyed$)
      )
      .subscribe(res => {
        if (res.status) {
          this.service.paymentUpdate = res.data;
          this.router.navigate(['transactions/payments', id, 'edit'], {queryParams: {paymentMode: 'child'}}).catch()
        } else {
          this.messageService.add({severity: ToastEnum.ERROR, summary: res.message});
        }
      })
  }

  showDetail(id: string): void {
    this.router.navigate(['/transactions/payments', id, 'payment-child-info']).catch()
  }

  issueMoney(): void {
    this.dialog.open(ConfirmDialogComponent, {
      disableClose: true,
      panelClass: 'custom-modalbox',
      data: {
        title: 'Вы уверены? Будет создана транзакция для вывода средств данного платежа',
        successButtonText: 'Подтвердить',
        cancelButtonText: 'Отмена'
      },
      maxWidth: '30vw'
    })
      .afterClosed()
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => {
        if (res) {
          this.getCreatePaymentIssueMoney();
        }
      });
  }

  private getCreatePaymentIssueMoney(): void {
    this.loading.set(true);
    this.paymentChildService.create(this.paymentId)
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntil(this.destroyed$)
      )
      .subscribe(res => {
        this.dialog.open(PaymentIssueMoneyDialogComponent, {
          disableClose: true,
          panelClass: 'custom-modalbox',
          data: res.data
        })
      });
  }

  private getPaymentChildren(params = this.queryParams): void {
    this.loading.set(true);
    this.paymentChildService.getPaymentChildren(this.paymentId, params)
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntil(this.destroyed$)
      )
      .subscribe(res => {
        if (res.status) {
          this.paymentChildren = res.data;
          this.paginate = res.meta.pagination;
        }
      })
  }

}
