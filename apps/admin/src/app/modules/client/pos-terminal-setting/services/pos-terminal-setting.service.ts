import { inject } from '@angular/core';
import { environment as env } from "@environments/environment";
import { IHttpResponse } from '@core/interfaces/http-response.interface';
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { IPosTerminalSettingInterface, IShift } from "@modules/client/pos-terminal-setting/interfaces/pos-terminal-setting.interface";

export class PosTerminalSettingService {
  private apiUrl = `${env.apiUrl}/${env.api.merchantComponents}`;
  private apiUrlShift = `${env.apiUrl}/${env.api.merchants}`;

  private readonly http = inject(HttpClient);

  getMerchantsComponents(merchantId: string): Observable<IHttpResponse<IPosTerminalSettingInterface[]>> {
    return this.http.get<IHttpResponse<IPosTerminalSettingInterface[]>>(`${this.apiUrl}/${merchantId}`);
  }

  updateMerchantComponents(payload: {componentId: string; merchantId: string}): Observable<IHttpResponse<IPosTerminalSettingInterface>> {
    return this.http.post<IHttpResponse<any>>(`${this.apiUrl}/${env.api.update}`, payload);
  }

  getShift(merchantId: string): Observable<IHttpResponse<IShift>> {
    return this.http.get<IHttpResponse<IShift>>(`${this.apiUrlShift}/${env.api.hasShift}/${merchantId}`);
  }

  updateShift(shift: { merchantId: string, hasShift: boolean }): Observable<IHttpResponse<IShift>> {
    return this.http.post<IHttpResponse<IShift>>(`${this.apiUrlShift}/${env.api.updateHasShift}`, shift);
  }
}
