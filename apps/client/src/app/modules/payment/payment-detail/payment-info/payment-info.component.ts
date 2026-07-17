import { Component, inject, OnInit } from '@angular/core';
import { takeUntil } from 'rxjs';
import { PaymentService } from '@modules/payment/services/payment.service';
import { ActivatedRoute } from '@angular/router';
import { IPaymentDetail } from '@modules/payment/interfaces/payment-detail.interface';
import { DestroyableComponent } from '@core/directives/destroyable.component';
import { ToastModule } from '@shared/components/toast/toast.module';

@Component({
  standalone: true,
  selector: 'em-payment-info',
  templateUrl: './payment-info.component.html',
  styleUrls: ['./payment-info.component.scss'],
  imports: [ToastModule],
  providers: [PaymentService],
})
export class PaymentInfoComponent extends DestroyableComponent implements OnInit {
  paymentDetail: IPaymentDetail;
  private service = inject(PaymentService);
  private activatedRoute = inject(ActivatedRoute);
  private id = this.activatedRoute.snapshot.parent.params['id'];

  ngOnInit(): void {
    this.getDetail();
  }

  getDetail(): void {
    this.service
      .getDetail(this.id)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => {
        if (res.status) {
          this.paymentDetail = res.data;
        }
      });
  }
}
