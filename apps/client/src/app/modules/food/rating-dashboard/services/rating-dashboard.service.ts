import { inject, Injectable } from '@angular/core';
import { environment as env } from '@environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Params } from '@angular/router';
import { Observable } from 'rxjs';
import { IHttpResponse } from '@core/interfaces/http-response.interface';
import { IRatingDashboard } from '@modules/food/rating-dashboard/interfaces/rating-dashboard';

@Injectable()
export class RatingDashboardService {
  private apiUrl = `${env.apiFoodUrl}/${env.api.restaurantRatings}`;
  private http = inject(HttpClient);

  getRatingDashboard(queryParams: Params): Observable<IHttpResponse<IRatingDashboard>> {
    const params = new HttpParams({ fromObject: queryParams });
    return this.http.get<IHttpResponse<IRatingDashboard>>(this.apiUrl, { params });
  }
}
