import { inject, Injectable } from '@angular/core';
import { Params } from '@angular/router';
import { forkJoin, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { QrPosAnalyticsApiService } from '@modules/analytics/services/qr-pos-analytics-api.service';
import {
  IQrPosAcquiringStructure,
  IQrPosDynamics,
  IQrPosGeography,
  IQrPosMetricCard,
  IQrPosPlanFactForecast,
} from '../interfaces/qr-pos-analytics.interface';
import {
  mapByRegionTop5,
  mapByServiceType,
  mapPlanFactForecast,
  mapSummaryCards,
  mapTurnoverDynamics
} from '@core/helpers/qr-pos-analytics/qr-pos-summary.helper';

@Injectable()
export class QrPosAnalyticService {
  private readonly api = inject(QrPosAnalyticsApiService);

  getCards(params: Params): Observable<IQrPosMetricCard[]> {
    return this.api.getSummaryCards(params).pipe(map(res => mapSummaryCards(res.data)));
  }

  getDynamics(params: Params): Observable<IQrPosDynamics> {
    return forkJoin([this.api.getTurnoverDynamics(params), this.api.getDateFilterPeriodKinds()]).pipe(
      map(([res, kinds]) => mapTurnoverDynamics(res.data, kinds[params['dateFilterTypeId']])),
    );
  }

  getPlanFact(params: Params): Observable<IQrPosPlanFactForecast> {
    return this.api.getTurnoverPlanFactForecast(params).pipe(map(res => mapPlanFactForecast(res.data)));
  }

  getAcquiring(params: Params): Observable<IQrPosAcquiringStructure> {
    return this.api.getTurnoverByServiceType(params).pipe(map(res => mapByServiceType(res.data)));
  }

  getGeography(params: Params): Observable<IQrPosGeography> {
    return this.api.getTurnoverByRegionTop5(params).pipe(map(res => mapByRegionTop5(res.data)));
  }
}
