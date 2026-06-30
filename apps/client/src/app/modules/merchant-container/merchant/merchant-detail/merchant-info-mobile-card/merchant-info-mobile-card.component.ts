import { Component, Input } from '@angular/core';
import { IMerchantDetail } from "@modules/merchant-container/merchant/interfaces/merchant-detail.interface";
import {
  MerchantInfoMobileCardConstants
} from "@modules/merchant-container/merchant/merchant-detail/merchant-info-mobile-card/merchant-info-mobile-card.constants";

@Component({
  selector: 'em-merchant-info-mobile-card',
  standalone: true,
  imports: [],
  templateUrl: './merchant-info-mobile-card.component.html',
  styleUrl: './merchant-info-mobile-card.component.scss'
})
export class MerchantInfoMobileCardComponent {
  @Input() merchantDetail!: IMerchantDetail;
  merchantDump = MerchantInfoMobileCardConstants.MERCHANT_DETAIL_DUMP;

  getValue(path: string): any {
    return path.split('.').reduce((acc: any, key: string) => acc?.[key], this.merchantDetail);
  }
}
