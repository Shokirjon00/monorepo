import { Injectable } from '@angular/core';
import { TODAY_ID } from '@core/helper';
import { BaseFilterStore } from '@core/abstract/base-filter-store';
import { IMerchantActivityFilter } from "@modules/analytics/merchant-activity/interfaces/merchant-activity.interface";

@Injectable()
export class MerchantActivityFilterService extends BaseFilterStore<IMerchantActivityFilter> {
  protected createDefault(): IMerchantActivityFilter {
    return { dateFilterTypeId: TODAY_ID, top: 10 };
  }
}
