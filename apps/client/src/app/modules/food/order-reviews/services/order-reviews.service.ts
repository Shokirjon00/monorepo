import { inject, Injectable } from '@angular/core';
import { environment as env } from '@environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IHttpResponse } from '@core/interfaces/http-response.interface';
import { IReviewsData } from '@modules/food/order-reviews/interfaces/reviews.interfaces';
import { Params } from '@angular/router';

@Injectable()

export class OrderReviewsService {
  private apiUrl = `${env.apiFoodUrl}/${env.api.orderReviews}`;
  private http = inject(HttpClient);

  getReviews(queryParams: Params): Observable<IHttpResponse<IReviewsData>> {
    const params = new HttpParams({ fromObject: queryParams });
    return this.http.get<IHttpResponse<IReviewsData>>(this.apiUrl, { params });
  }
}
