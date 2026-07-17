import { Injectable } from '@angular/core';
import { Params } from '@angular/router';
import { TODAY_ID } from '@core/helper';
import { BaseFilterStore } from '@core/abstract/base-filter-store';
import { IQrPosFilter } from '../interfaces/qr-pos-analytics.interface';
import { QrPosChannel } from "@core/enums/qr-pos-enum";

@Injectable()
export class QrPosFilterService extends BaseFilterStore<IQrPosFilter> {
  applyFromRoute(query: Params): void {
    if (!query || !Object.keys(query).length) return;
    const channel = (query['serviceGroup'] as QrPosChannel) || QrPosChannel.All;
    this._filter.set({
      dateFilterTypeId: query['dateFilterTypeId'] || TODAY_ID,
      startDate: query['startDate'] || undefined,
      endDate: query['endDate'] || undefined,
      companyId: query['companyId'] || undefined,
      merchantId: query['merchantId'] || undefined,
      posId: query['posId'] || undefined,
      channel,
      statusId: query['statusId'] || undefined,
      regionId: query['regionId'] || undefined,
      currencyId: query['currencyId'] || undefined,
    });
  }

  toRouteParams(): Params {
    return Object.entries(this._filter()).reduce<Params>((acc, [key, value]) => {
      if (value === null || value === undefined || value === '') return acc;
      if (key === 'channel') {
        if (value !== QrPosChannel.All) acc['serviceGroup'] = value as string;
        return acc;
      }
      acc[key] = value;
      return acc;
    }, {});
  }

  protected createDefault(): IQrPosFilter {
    return {
      dateFilterTypeId: TODAY_ID,
      channel: QrPosChannel.All,
    };
  }

  protected override toParams(filter: IQrPosFilter): Params {
    return Object.entries(filter).reduce<Params>((acc, [key, value]) => {
      if (value === null || value === undefined || value === '') return acc;

      if (key === 'channel') {
        if (value === QrPosChannel.Qr || value === QrPosChannel.Pos) {
          acc['serviceGroup'] = value;
        }
        return acc;
      }

      if (key === 'statusId') {
        acc['PaymentStatusId'] = value;
        return acc;
      }

      acc[key] = value;
      return acc;
    }, {});
  }
}
