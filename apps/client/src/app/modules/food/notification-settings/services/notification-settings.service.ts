import { inject, Injectable } from '@angular/core';
import { environment as env } from "@environments/environment";
import { HttpClient } from '@angular/common/http';
import { map, Observable, of } from 'rxjs';
import { IHttpResponse } from "@core/interfaces/http-response.interface";
import { ISelect } from '@eskhata/util';
import { catchError } from 'rxjs/operators';
import {
  ITelegramStatusResponse
} from '@modules/food/notification-settings/interfaces/notification-settings.interface';

@Injectable()
export class NotificationSettingsService {
  private apiUrl = `${env.apiFoodUrl}/${env.api.telegramBotSubscribers}`;
  private http = inject(HttpClient)

  getTelegramSubscriptionStatus(): Observable<IHttpResponse<ITelegramStatusResponse>> {
    return this.http.get<IHttpResponse<ITelegramStatusResponse>>(`${this.apiUrl}/status`);
  }

  getRestaurantPointIds(): Observable<string[]> {
    const apiUrl = `${env.apiUrl}/${env.api.merchants}/${env.api.dictionary}`;

    return this.http
      .post<IHttpResponse<ISelect[]>>(apiUrl, {})
      .pipe(
        map(res => res.status && res.data
          ? res.data.map(item => item.id) : [] ),
        catchError(() => of([]))
      );
  }

  createTelegramSubscriber(restaurantPointIds: string[]): Observable<IHttpResponse<{ id: string, telegramLink:string }>> {
    return this.http.post<IHttpResponse<{ id: string, telegramLink: string }>>(`${this.apiUrl}/${env.api.create}`, {
      restaurantPointIds
    });
  }

  confirmSubscriber(token: string): Observable<IHttpResponse<any>> {
    return this.http.post<IHttpResponse<any>>(`${this.apiUrl}/${env.api.confirm}`, {
      token
    });
  }

  updateTelegramNotifications(isActive: boolean, restaurantPointIds: string[]): Observable<IHttpResponse<any>> {
    return this.http.post<IHttpResponse<any>>(`${this.apiUrl}/${env.api.update}`, {
      isActive,
      restaurantPointIds
    });
  }
}

