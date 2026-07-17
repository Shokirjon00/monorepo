import { inject, Injectable } from '@angular/core';
import { Params } from '@angular/router';
import { forkJoin, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { QrPosAnalyticsApiService } from '@modules/analytics/services/qr-pos-analytics-api.service';
import {
  IErrorItem,
  IMetricCard,
  IPlanFactForecast,
  IRankItem,
  ITimeSeries,
  ITurnoverForecast,
} from '../interfaces/merchant-activity.interface';
import {
  mapForecast,
  mapMerchantsActivityCards,
  mapMerchantsActivityDynamics,
  mapMerchantsPlanFactForecast,
  mapParkCards,
  mapParkTop,
  mapTopByTurnover,
  mapWithoutTransactions
} from '@core/helpers/qr-pos-analytics/merchant-activity.helper';

@Injectable()
export class MerchantActivityService {
  private readonly api = inject(QrPosAnalyticsApiService);

  getMerchantsCards(params: Params): Observable<IMetricCard[]> {
    return this.api.getMerchantsActivityCards(params).pipe(map(res => mapMerchantsActivityCards(res.data)));
  }

  getMerchantsDynamics(params: Params): Observable<ITimeSeries> {
    return forkJoin([this.api.getMerchantsActivityDynamics(params), this.api.getDateFilterPeriodKinds()]).pipe(
      map(([res, kinds]) => mapMerchantsActivityDynamics(res.data, kinds[params['dateFilterTypeId']])),
    );
  }

  getMerchantsPlanFact(params: Params): Observable<IPlanFactForecast> {
    return this.api.getMerchantsActivePlanFactForecast(params).pipe(map(res => mapMerchantsPlanFactForecast(res.data)));
  }

  getMerchantsTop(params: Params): Observable<IRankItem[]> {
    return this.api.getMerchantsTopByTurnover(params).pipe(map(res => mapTopByTurnover(res.data)));
  }

  getMerchantsNoTx(params: Params): Observable<IRankItem[]> {
    const withoutTxParams: Params = { ...params, limit: 10 };
    delete withoutTxParams['top'];
    return this.api.getMerchantsWithoutTransactions(withoutTxParams).pipe(map(res => mapWithoutTransactions(res.data)));
  }

  getParkCards(params: Params, label: 'POS' | 'QR'): Observable<IMetricCard[]> {
    return this.api.getParkCards(params).pipe(map(res => mapParkCards(res.data, label)));
  }

  getParkTop(params: Params): Observable<IRankItem[]> {
    return this.api.getParkTopMerchants(params).pipe(map(res => mapParkTop(res.data)));
  }

  getForecast(params: Params): Observable<ITurnoverForecast> {
    return this.api.getForecastTurnover(params).pipe(map(res => mapForecast(res.data)));
  }

  errors(): IErrorItem[] {
    return [
      {code: '91', description: 'Таймаут соединения', count: 245},
      {code: '05', description: 'Отказ в авторизации', count: 186},
      {code: '55', description: 'Недостаточно средств', count: 166},
      {code: '96', description: 'Ошибка формата ответа', count: 120},
      {code: '58', description: 'Истекло время операции', count: 85},
      {code: '57', description: 'Неверный терминал', count: 72},
      {code: '12', description: 'Дубликат транзакции', count: 64},
      {code: '07', description: 'Связь с банком нестабильна', count: 51},
      {code: '99', description: 'Техническая ошибка', count: 45},
    ];
  }
}
