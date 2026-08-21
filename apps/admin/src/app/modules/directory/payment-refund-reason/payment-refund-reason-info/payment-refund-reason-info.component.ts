import { Component, inject, OnInit } from '@angular/core';
import { DestroyableComponent } from '@eskhata/util';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntil } from 'rxjs';
import {
  PaymentRefundReasonService
} from '@modules/directory/payment-refund-reason/services/payment-refund-reason.service';
import {
  IPaymentRefundReasonDetail
} from '@modules/directory/payment-refund-reason/interfaces/payment-refund-reason-detail.interface';
import { NgxPermissionsModule } from "ngx-permissions";
import { SvgIconComponent } from "angular-svg-icon";
import { DateTimePipe } from '@eskhata/util';
import { EmHeaderComponent } from '@eskhata/ui';

@Component({
  standalone: true,
  selector: 'em-payment-refund-reason-info',
  templateUrl: './payment-refund-reason-info.component.html',
  styleUrls: ['./payment-refund-reason-info.component.scss'],
  providers: [PaymentRefundReasonService],
  imports: [
    NgxPermissionsModule,
    SvgIconComponent,
    DateTimePipe,
    EmHeaderComponent
  ]
})
export class PaymentRefundReasonInfoComponent extends DestroyableComponent implements OnInit {
  paymentRefundReasonDetail: IPaymentRefundReasonDetail;
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly service = inject(PaymentRefundReasonService);
  private refundReasonId = this.activatedRoute.snapshot.params['id'];

  ngOnInit(): void {
    this.service.getPaymentRefundReasonDetail(this.refundReasonId)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => {
        this.paymentRefundReasonDetail = res.data;
      });
  }

  navigateToUpdate(): void {
    this.router.navigate(['directory/refund-reason/edit', this.refundReasonId])
      .catch()
  }
}
