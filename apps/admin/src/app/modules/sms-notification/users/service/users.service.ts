import { inject, Injectable } from '@angular/core';
import { environment as env } from '@environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IHttpResponse } from '@core/interfaces/http-response.interface';
import {ISmsNotification} from "@modules/sms-notification/users/interface/users";

@Injectable()
export class UsersService {
  private apiUrl = `${env.apiUrl}/${env.api.notificationSettings}`;
  private http = inject(HttpClient);

  getDetail(): Observable<IHttpResponse<ISmsNotification>> {
    return this.http.get<IHttpResponse<ISmsNotification>>(this.apiUrl);
  }

  create(data: ISmsNotification): Observable<IHttpResponse<ISmsNotification>> {
    return this.http.post<IHttpResponse<ISmsNotification>>(`${this.apiUrl}/${env.api.create}`, data);
  }
}
