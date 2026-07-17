import { AfterViewInit, Component, inject, viewChild } from '@angular/core';
import { TableComponent } from '@shared/components/table/table.component';
import { ToastComponent } from '@shared/components/toast/toast.component';
import { IPaymentHistory } from '@modules/transactions/payments/interfaces';
import { ICaption, IPaginate } from '@core/interfaces';
import { PAYMENTHISTORY_COLUMNS } from './payment-history.columns';
import { PaymentsService } from '@modules/transactions/services/payments.service';
import { finalize } from 'rxjs/operators';
import { takeUntil } from 'rxjs';
import { ActionsComponent } from '@shared/components/actions/actions.component';
import { ITab } from '@core/interfaces/header.interface';
import { IAction } from '@shared/components/actions/actions.interface';
import { PaymentsDetailConstants } from '@modules/transactions/payments/payment-detail/payment-detail.constants';
import {
  PaymentsHistoryConstants
} from '@modules/transactions/payments/payment-detail/payment-history/payment-history.constants';
import { AbstractPaymentComponent } from '@modules/transactions/abstract/payment.abstract';
import {
  PaymentHistoryService
} from '@modules/transactions/payments/payment-detail/payment-history/services/payment-history.service';
import { EmHeaderComponent } from '@shared/components/em-header/em-header.component';
import { EMPaginationComponent } from '@shared/components/em-pagination/pagination.component';
import { EbLoaderComponent } from "@shared/components/eb-loader/eb-loader.component";

@Component({
  standalone: true,
  selector: 'em-payment-history',
  templateUrl: './payment-history.component.html',
  styleUrls: ['./payment-history.component.scss'],
  imports: [
    ToastComponent,
    TableComponent,
    ActionsComponent,
    EmHeaderComponent,
    EMPaginationComponent,
    EbLoaderComponent
  ],
  providers: [PaymentHistoryService, PaymentsService]

})
export class PaymentHistoryComponent extends AbstractPaymentComponent<any> implements AfterViewInit {
  readonly table = viewChild(TableComponent);
  paymentHistory: IPaymentHistory[];
  tabMenuItems: ITab[];
  actions: IAction[] = PaymentsHistoryConstants.getActions(this.paymentId);
  paginate: IPaginate | any;
  actionStatus: boolean = false;

  readonly captionKey = 'payment-history';
  readonly captions = PAYMENTHISTORY_COLUMNS;
  private readonly paymentHistoryService = inject(PaymentHistoryService);
  constructor(
    paymentsService: PaymentsService,
  ) {
    super(paymentsService)
    this.tabMenuItems = PaymentsDetailConstants.getHeaderTabs(this.paymentId);
    this.getPaymentHistory(this.paymentId)
  }

  ngAfterViewInit(): void {
    this.captions.map((x: any, i: any,) => ({key: x, index: i, isSelected: true} as ICaption));
    this.table().render(this.captions, this.paymentHistory);
  }


  private getPaymentHistory(paymentId: string): void {
    this.loading.set(true);
    this.paymentHistoryService.getPaymentHistories(paymentId)
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntil(this.destroyed$)
      )
      .subscribe(res => {
        if (res.status) {
          this.paymentHistory = res.data;
          this.paginate = res.meta.pagination;
        }
      });
  }
}
