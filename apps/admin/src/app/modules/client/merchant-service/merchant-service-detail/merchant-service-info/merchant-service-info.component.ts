import { Component, inject, OnInit } from '@angular/core';
import { finalize, takeUntil } from 'rxjs';
import { DestroyableComponent } from '@eskhata/util';
import { ActivatedRoute, Router } from '@angular/router';
import { SvgIconComponent } from "angular-svg-icon";
import { NgxPermissionsModule } from "ngx-permissions";
import { MerchantServiceService } from "@modules/client/merchant-service/services/merchant-service.service";
import { IMerchantService } from "@modules/client/merchant-service/interfaces/merchant-service.interface";
import { EmHeaderComponent, TableComponent } from '@eskhata/ui';
import { IPaginate } from '@eskhata/util';
import { MERCHANT_SERVICE_INFO_COLUMNS } from "@modules/client/merchant-service/merchant-service-detail/merchant-service-info/merchant-service-info.columns";

@Component({
  standalone: true,
  selector: 'em-merchant-services-info',
  templateUrl: './merchant-service-info.component.html',
  styleUrls: ['./merchant-service-info.component.scss'],
  providers: [MerchantServiceService],
  imports: [
    SvgIconComponent,
    NgxPermissionsModule,
    TableComponent,
    EmHeaderComponent
  ]
})
export class MerchantServiceInfoComponent extends DestroyableComponent implements OnInit {
  merchantServiceDetail: any;
  loading: boolean;
  paginate: IPaginate | any;
  merchantServiceParamsList: IMerchantService[];
  captions = MERCHANT_SERVICE_INFO_COLUMNS;
  captionKey = 'issue-info-table';
  private router = inject(Router);
  private merchantService = inject(MerchantServiceService);
  private activatedRoute = inject(ActivatedRoute);
  private paramId = this.activatedRoute.snapshot.parent.params['serviceId'];
  private merchantId = this.activatedRoute.snapshot.parent.parent.parent.parent.params['merchantId'];

  ngOnInit(): void {
    this.getDetail();
  }

  navigateToInfo(): void {
    this.router.navigate(['/clients/merchant', this.merchantId, 'service', this.paramId, 'edit']).catch()
  }

  private getDetail(): void {
    this.loading = true;
    this.merchantService.getMerchantServiceDetail(this.merchantId, this.paramId)
      .pipe(
        finalize(() => this.loading = false),
        takeUntil(this.destroyed$)
      )
      .subscribe(res => {
        this.merchantServiceDetail = res.data;
        this.merchantServiceParamsList = this.merchantServiceDetail.merchantServiceParams;
      });
  }
}
