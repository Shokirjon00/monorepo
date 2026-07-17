import { Component, inject, OnInit } from '@angular/core';
import { takeUntil } from 'rxjs';
import { DestroyableComponent } from '@core/abstract/destroyable.component';
import { BreadcrumbService } from 'xng-breadcrumb';
import { ActivatedRoute } from '@angular/router';
import { BankPromotionService } from '@modules/bank-promotion/services/bank-promotion.service';
import { IBankPromotion } from '@modules/bank-promotion/interfaces/bank-promotion.interface';
import { CommonModule } from "@angular/common";
import { NgxPermissionsModule } from "ngx-permissions";
import { DateTimePipe } from "@core/pipe/date-time.pipe";
import { ActionsComponent } from "@shared/components/actions/actions.component";
import { EmHeaderComponent } from "@shared/components/em-header/em-header.component";
import { IAction } from "@shared/components/actions/actions.interface";
import { BankPromotionInfoConstants } from "@modules/bank-promotion/bank-promotion-detail/bank-promotion-info/bank-promotion-info.constants";

@Component({
  standalone: true,
  selector: 'em-merchant-services-info',
  templateUrl: './bank-promotion-info.component.html',
  styleUrls: ['./bank-promotion-info.component.scss'],
  imports: [
    CommonModule,
    NgxPermissionsModule,
    DateTimePipe,
    ActionsComponent,
    EmHeaderComponent
  ],
  providers: [BankPromotionService]
})
export class BankPromotionInfoComponent extends DestroyableComponent implements OnInit {
  promotionDetail: IBankPromotion;
  private readonly service = inject(BankPromotionService);
  private readonly breadcrumbService = inject(BreadcrumbService);
  private readonly activatedRoute = inject(ActivatedRoute);

  bankPromotionId = this.activatedRoute.snapshot.parent.params['bankPromotionId'];
  actions: IAction[] = BankPromotionInfoConstants.getActions(this.bankPromotionId)

  ngOnInit(): void {
    this.getDetail()
  }

  private getDetail(): void {
    this.breadcrumbService.set('@companyDetail', {skip: true});
    this.service.getIBankPromotionById(this.bankPromotionId)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => {
        this.promotionDetail = res.data;
        this.breadcrumbService.set('@companyDetail', {label: this.promotionDetail.bankCashbackName, skip: false});
      })
  }
}
