import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { EmHeaderComponent } from '@eskhata/ui';
import { NgxPermissionsAllowStubDirective, NgxPermissionsModule } from "ngx-permissions";
import { SvgIconComponent } from "angular-svg-icon";
import { DestroyableComponent } from '@eskhata/util';
import { ActivatedRoute, Router } from "@angular/router";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { PaymentStatusDetailService } from "@modules/directory/payment-status/services/payment-status.service";
import { IPaymentStatusDetail } from "@modules/directory/payment-status/interfaces/payment-status-detail.interfaces";

@Component({
  selector: 'em-payment-status-info',
  imports: [
    EmHeaderComponent,
    NgxPermissionsModule,
    SvgIconComponent,
    NgxPermissionsAllowStubDirective
  ],
  templateUrl: './payment-status-info.component.html',
  styleUrl: './payment-status-info.component.scss',
  providers:[PaymentStatusDetailService],
})
export class PaymentStatusInfoComponent extends DestroyableComponent implements OnInit {
  paymentStatusDetail: IPaymentStatusDetail;

  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private service = inject(PaymentStatusDetailService);
  private readonly destroyRef = inject(DestroyRef);

  private categoryId = this.activatedRoute.snapshot.params['id'];



  ngOnInit(): void {
    this.service.getPaymentStatusDetailById(this.categoryId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(res => {
        this.paymentStatusDetail = res.data;
      });
  }

  navigateToUpdate(): void {
    this.router.navigate(['directory/payment-status-detail/edit', this.categoryId])
      .catch()
  }
}
