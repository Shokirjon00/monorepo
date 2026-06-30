import { AfterViewInit, Component, inject, OnInit, viewChild } from '@angular/core';
import { DestroyableComponent } from "@core/directives/destroyable.component";
import { TableComponent } from "@shared/components/table/table.component";
import { ICaption } from "@core/interfaces/table.interface";
import { IPaymentHistory } from "@modules/payment/interfaces/payment-history.interface";
import { ActivatedRoute } from "@angular/router";
import { PaymentService } from "@modules/payment/services/payment.service";
import { finalize, takeUntil } from "rxjs";
import { EskhataBankLoaderComponent } from "@shared/components/eskhata-bank-loader/eskhata-bank-loader.component";
import { ToastModule } from "@shared/components/toast/toast.module";
import { PaymentHistoryConstants } from '@modules/payment/payment-detail/payment-history/payment-history.constants';


@Component({
  standalone: true,
  selector: 'em-payment-history',
  templateUrl: './payment-history.component.html',
  styleUrls: ['./payment-history.component.scss'],
  imports: [
    EskhataBankLoaderComponent,
    ToastModule,
    TableComponent
]
})
export class PaymentHistoryComponent extends DestroyableComponent implements AfterViewInit, OnInit{
  readonly table = viewChild(TableComponent);
  loading: boolean;
  paymentHistory: IPaymentHistory[];
  captions: ICaption[] = PaymentHistoryConstants.PAYMENT_HISTORY_COLUMNS
  captionKey = 'payment-history'
  private readonly paymentId: string;
  private activatedRoute = inject(ActivatedRoute);
  private service = inject(PaymentService)

  constructor() {
    super();
    this.paymentId = this.activatedRoute.snapshot.parent.params['id'];
  }

  ngOnInit(): void {
    this.getPaymentHistory();
  }

  ngAfterViewInit(): void {
    this.captions.map((x: any, i: any,) => ({
      key: x,
      index: i,
      isSelected: true
    } as ICaption));
    this.table().render(this.captions, this.paymentHistory);
  }

  private getPaymentHistory(): void {
    this.loading = true;
    this.service.getPaymentHistories(this.paymentId)
      .pipe(
        finalize(() => this.loading = false),
        takeUntil(this.destroyed$)
      )
      .subscribe(res => this.paymentHistory = res.data)
  }
}
