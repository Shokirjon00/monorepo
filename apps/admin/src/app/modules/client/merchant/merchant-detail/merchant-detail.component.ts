import { Component, inject, OnInit } from '@angular/core';
import { ICaption } from '@eskhata/util';
import { IAction } from '@eskhata/util';
import { ActionEnum } from '@eskhata/util';
import { DestroyableComponent } from '@eskhata/util';
import { ActivatedRoute, RouterOutlet } from '@angular/router';
import { HeaderService } from '@core/services/header.service';
import { takeUntil } from 'rxjs';
import { BreadcrumbService } from 'xng-breadcrumb';
import { MerchantService } from '@modules/client/merchant/services/merchant.service';
import { IMerchantDetail } from '@modules/client/merchant/interfaces/merchant-detail.interface';

@Component({
  standalone: true,
  selector: 'em-merchant-container',
  template: '<router-outlet />',
  imports: [RouterOutlet],
  providers: [MerchantService]
})

export class MerchantDetailComponent extends DestroyableComponent implements OnInit {
  merchantDetail: IMerchantDetail;
  captions: ICaption[] = [];

  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly breadcrumbService = inject(BreadcrumbService);
  private readonly service = inject(MerchantService);

  merchantId = this.activatedRoute.snapshot.params['merchantId'];
  actions: IAction[] = [
    {
      code: ActionEnum.ADD,
      path: `clients/poses/${this.merchantId}/new`,
      tooltipName: 'Добавить кассу'
    },
    {
      code: ActionEnum.EDIT,
      path: `clients/merchants/edit/${this.merchantId}`,
      tooltipName: 'Редактировать',
      permissionName: 'MerchantUpdate'
    },
  ];

  constructor(
    headerService: HeaderService,
  ) {
    super();
    headerService.setMerchantId(this.merchantId);
  }

  ngOnInit(): void {
    this.getDetail();
  }

  private getDetail(): void {
    this.breadcrumbService.set('@merchantDetail', {skip: true});
    this.service.getDetail(this.merchantId)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => {
        this.merchantDetail = res.data;
        this.breadcrumbService.set('@merchantDetail', {label: this.merchantDetail.name, skip: false});
      })
  }
}
