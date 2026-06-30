import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterOutlet } from '@angular/router';
import { HeaderService } from '@core/services/header.service';
import { MerchantService } from '@modules/merchant-container/merchant/services/merchant.service';
import { BreadcrumbService } from 'xng-breadcrumb';
import { takeUntil } from 'rxjs';
import { IMerchantDetail } from '@modules/merchant-container/merchant/interfaces/merchant-detail.interface';
import { DestroyableComponent } from '@core/directives/destroyable.component';
import { AccountService } from '@modules/merchant-container/account/services/account.service';
import { IntegrationService } from '@modules/merchant-container/merchant/services/integration.service';
import { provideNgxMask } from 'ngx-mask';

@Component({
  standalone: true,
  selector: 'em-merchant-detail',
  template: '<router-outlet />',
  imports: [RouterOutlet],
  providers: [MerchantService, AccountService, IntegrationService, provideNgxMask()],
})
export class MerchantDetailComponent extends DestroyableComponent implements OnInit {
  merchantDetail: IMerchantDetail;
  private activatedRoute = inject(ActivatedRoute);
  private breadcrumbService = inject(BreadcrumbService);
  private service = inject(MerchantService);
  readonly headerService = inject(HeaderService);

  merchantId = this.activatedRoute.snapshot.params['merchantId'];

  constructor() {
    super();
    this.headerService.setMerchantId(this.merchantId);
  }

  ngOnInit(): void {
    this.getDetail();
  }
  private getDetail(): void {
    this.breadcrumbService.set('@merchantDetail', { skip: true });
    this.service
      .getDetail(this.merchantId)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => {
        if (res.status) {
          this.merchantDetail = res.data;
          this.breadcrumbService.set('@merchantDetail', { label: this.merchantDetail.name, skip: false });
        }
      });
  }
}
