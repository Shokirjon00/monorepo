import { inject, Injectable } from '@angular/core';
import { environment as env } from '@environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Params } from '@angular/router';
import { Observable, forkJoin } from 'rxjs';
import { IHttpResponse } from '@core/interfaces/http-response.interface';
import { ENDPOINTS } from '@core/endpoints';
import { IUploadField } from '@shared/components/upload-field/interface/upload-field.interface';
import {
  ISupportCenter,
  ISupportCenterRequest,
} from '@core/interfaces';
import { ISupportCenterRating } from '@modules/support-center/interfaces/support-center-rating.interface';
import { IMessageCard } from '@shared/components/message-card/interfaces/message-card.interface';

@Injectable()
export class SupportCenterService {
  private apiUrl = `${env.apiUrl}/${ENDPOINTS.supportApplications}`;
  private http = inject(HttpClient);

  getSupportCenters(queryParams: Params): Observable<IHttpResponse<ISupportCenter[]>> {
    const params = new HttpParams({fromObject: queryParams});
    return this.http.get<IHttpResponse<ISupportCenter[]>>(this.apiUrl, {params});
  }

  getSupportCenterById(id: string, queryParams?: Params): Observable<IHttpResponse<ISupportCenter>> {
    const params = new HttpParams({fromObject: queryParams});
    return this.http.get<IHttpResponse<ISupportCenter>>(`${this.apiUrl}/${id}`, {params});
  }

  createAppeal(messageData: ISupportCenterRequest): Observable<IHttpResponse<Partial<ISupportCenterRequest>>> {
    return this.http.post<IHttpResponse<Partial<ISupportCenterRequest>>>(
      `${this.apiUrl}/${ENDPOINTS.create}`,
      messageData
    );
  }

  cancelAppeal(id: string): Observable<IHttpResponse<string>> {
    return this.http.post<IHttpResponse<string>>(`${this.apiUrl}/${ENDPOINTS.cancel}`,
      {id}
    );
  }

  uploadFiles(files: File | File[]): Observable<IHttpResponse<IUploadField> | IHttpResponse<IUploadField>[]> {
    const fileArray = Array.isArray(files) ? files : [files];

    const uploadRequests = fileArray.map(file => {
      const formData = new FormData();
      formData.append('file', file);

      return this.http.post<IHttpResponse<IUploadField>>(
        `${this.apiUrl}/upload`,
        formData
      );
    });

    return fileArray.length === 1
      ? uploadRequests[0]
      : forkJoin(uploadRequests);
  }

  sendMessage(messageData: Partial<IMessageCard>): Observable<IHttpResponse<Partial<IMessageCard>>> {
    return this.http.post<IHttpResponse<Partial<IMessageCard>>>(
      `${this.apiUrl}/send_message`,
      messageData
    );
  }

  submitRating(ratingData: ISupportCenterRating): Observable<IHttpResponse<Partial<ISupportCenterRating>>> {
    return this.http.post<IHttpResponse<Partial<ISupportCenterRating>>>(
      `${this.apiUrl}/rating`,
      ratingData
    );
  }
}
