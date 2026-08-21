import { inject, Injectable } from '@angular/core';
import { environment as env } from "@environments/environment";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Params } from "@angular/router";
import { Observable } from "rxjs";
import { IHttpResponse } from "@core/interfaces/http-response.interface";
import { ISupportCenterInterfaces } from "@modules/support-center/interfaces/support-center.interfaces";
import { ISelect } from "@core/interfaces";
import { ISupportCenterInfoInterfaces } from "@modules/support-center/interfaces/support-center-info.interfaces";
import { ChangeOrderStatusRequest, ChangeUserRequest, SendMessageRequest } from "@modules/support-center/interfaces/support-application.model";

@Injectable()
export class SupportCenterService {
  private apiUrl = `${env.apiUrl}/${env.api.supportApplications}`;
  private http = inject(HttpClient);

  getSupport(queryParams: Params): Observable<IHttpResponse<ISupportCenterInterfaces[]>> {
    const params = new HttpParams({fromObject: queryParams});
    return this.http.get<IHttpResponse<ISupportCenterInterfaces[]>>(this.apiUrl, {params});
  }

  getSupportDetail(iftLogId: string): Observable<IHttpResponse<ISupportCenterInfoInterfaces>> {
    return this.http.get<IHttpResponse<ISupportCenterInfoInterfaces>>(`${this.apiUrl}/${iftLogId}`);
  }

  getReceiptType(): Observable<IHttpResponse<ISelect[]>> {
    return this.http.get<IHttpResponse<ISelect[]>>(`${env.apiUrl}/${env.api.supportApplicationsStatuses}/${env.api.dictionary}`, {});
  }

  changeOrderStatus(body: ChangeOrderStatusRequest): Observable<IHttpResponse<ChangeOrderStatusRequest>> {
    return this.http.post<IHttpResponse<ChangeOrderStatusRequest>>(`${this.apiUrl}/${env.api.changeStatus}`, body);
  }

  changeUser(body: ChangeUserRequest): Observable<IHttpResponse<ChangeUserRequest>> {
    return this.http.post<IHttpResponse<ChangeUserRequest>>(`${this.apiUrl}/${env.api.assignUser}`, body);
  }

  send_message(body: SendMessageRequest): Observable<IHttpResponse<SendMessageRequest>> {
    return this.http.post<IHttpResponse<SendMessageRequest>>(`${this.apiUrl}/${env.api.sendMessage}`, body);
  }

}
