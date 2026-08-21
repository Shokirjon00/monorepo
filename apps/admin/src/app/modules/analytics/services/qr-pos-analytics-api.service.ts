import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { Params } from '@angular/router';
import { environment as env } from '@environments/environment';
import { IHttpResponse } from '@core/interfaces/http-response.interface';
import { ISelect } from '@eskhata/util';
import {
  IByServiceTypeInterface,
  IForecastTurnoverInterface,
  IMerchantRankInterface,
  IMerchantsActivityCardsInterface,
  IMerchantsActivityDynamicsInterface,
  IMerchantWithoutTxInterface,
  IParkCardsInterface,
  IPlanFactForecastInterface,
  IRegionInterface,
  ISummaryCardsInterface,
  ITurnoverDynamicsInterface,
} from '../interfaces/qr-pos-analytics.interface';
import { IQrPosServerSettings } from "@modules/analytics/qr-pos-analytics/interfaces/qr-pos-analytics.interface";
import { buildPeriodKindMap, PeriodKind } from '@core/helpers/qr-pos-analytics/qr-pos-period.helper';

@Injectable({ providedIn: 'root' })
export class QrPosAnalyticsApiService {
  private readonly base = `${env.apiUrl}/${env.api.qrPosAnalytics}`;
  private readonly http = inject(HttpClient);

  private periodKinds$?: Observable<Record<string, PeriodKind>>;

  getDateFilterPeriodKinds(): Observable<Record<string, PeriodKind>> {
    if (!this.periodKinds$) {
      const url = `${env.apiUrl}/${env.api.analytics}/${env.api.dateFilter}`;
      this.periodKinds$ = this.http.get<IHttpResponse<ISelect[]>>(url).pipe(
        map(res => buildPeriodKindMap(res.data ?? [])),
        shareReplay(1),
      );
    }
    return this.periodKinds$;
  }

  getSummaryCards(params: Params = {}): Observable<IHttpResponse<ISummaryCardsInterface>> {
    return this.get(env.api.qrPosSummaryCards, params);
  }

  getTurnoverDynamics(params: Params = {}): Observable<IHttpResponse<ITurnoverDynamicsInterface>> {
    return this.get(`${env.api.turnover}/${env.api.qrPosDynamics}`, params);
  }

  getTurnoverPlanFactForecast(params: Params = {}): Observable<IHttpResponse<IPlanFactForecastInterface>> {
    return this.get(`${env.api.turnover}/${env.api.qrPosPlanFactForecast}`, params);
  }

  getTurnoverByServiceType(params: Params = {}): Observable<IHttpResponse<IByServiceTypeInterface>> {
    return this.get(`${env.api.turnover}/${env.api.qrPosByServiceType}`, params);
  }

  getTurnoverByRegionTop5(params: Params = {}): Observable<IHttpResponse<IRegionInterface[]>> {
    return this.get(`${env.api.turnover}/${env.api.qrPosByRegionTop5}`, params);
  }

  getMerchantsActivityCards(params: Params = {}): Observable<IHttpResponse<IMerchantsActivityCardsInterface>> {
    return this.get(`${env.api.merchants}/${env.api.qrPosMerchantsActivityCards}`, params);
  }

  getMerchantsActivityDynamics(params: Params = {}): Observable<IHttpResponse<IMerchantsActivityDynamicsInterface>> {
    return this.get(`${env.api.merchants}/${env.api.qrPosMerchantsActivityDynamics}`, params);
  }

  getMerchantsActivePlanFactForecast(params: Params = {}): Observable<IHttpResponse<IPlanFactForecastInterface>> {
    return this.get(`${env.api.merchants}/${env.api.qrPosMerchantsActivePlanFactForecast}`, params);
  }

  getMerchantsTopByTurnover(params: Params = {}): Observable<IHttpResponse<IMerchantRankInterface[]>> {
    return this.get(`${env.api.merchants}/${env.api.qrPosMerchantsTopByTurnover}`, params);
  }

  getMerchantsWithoutTransactions(params: Params = {}): Observable<IHttpResponse<IMerchantWithoutTxInterface[]>> {
    return this.get(`${env.api.merchants}/${env.api.qrPosMerchantsWithoutTransactions}`, params);
  }

  getParkCards(params: Params = {}): Observable<IHttpResponse<IParkCardsInterface>> {
    return this.get(`${env.api.park}/${env.api.cards}`, params);
  }

  getParkTopMerchants(params: Params = {}): Observable<IHttpResponse<IMerchantRankInterface[]>> {
    return this.get(`${env.api.park}/${env.api.qrPosParkTopMerchants}`, params);
  }

  getForecastTurnover(params: Params = {}): Observable<IHttpResponse<IForecastTurnoverInterface>> {
    return this.get(`${env.api.forecast}/${env.api.turnover}`, params);
  }

  getSettings(): Observable<IHttpResponse<IQrPosServerSettings>> {
    return this.get(env.api.settings, {});
  }

  updateSettings(payload: IQrPosServerSettings): Observable<IHttpResponse<IQrPosServerSettings>> {
    return this.http.post<IHttpResponse<IQrPosServerSettings>>(`${this.base}/${env.api.settings}/${env.api.qrPosSettingsUpdate}`, payload);
  }

  private get<T>(path: string, params: Params): Observable<IHttpResponse<T>> {
    const httpParams = new HttpParams({ fromObject: params ?? {} });
    return this.http.get<IHttpResponse<T>>(`${this.base}/${path}`, { params: httpParams });
  }
}
