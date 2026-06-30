import { inject, Injectable } from '@angular/core';
import { environment as env } from "@environments/environment";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Params } from "@angular/router";
import { Observable } from "rxjs";
import { IHttpResponse } from "@core/interfaces/http-response.interface";
import { IDirectoryOptions } from "@modules/directory/directory-options/interfaces/directory-options.interfaces";
import { IUserAdmin } from "@modules/user/user-admin/interfaces/user-admin.interface";
import { IDirectoryOptionsDetail } from "@modules/directory/directory-options/interfaces/directory-options-detail.interfaces";

@Injectable({
  providedIn: 'root'
})
export class DirectoryOptionsService {

  private apiUrl = `${env.apiUrl}/${env.api.serviceParams}`
  private http = inject(HttpClient);

  getDirectoryOptions(queryParams: Params): Observable<IHttpResponse<IDirectoryOptions[]>> {
    const params = new HttpParams({fromObject: queryParams});
    return this.http.get<IHttpResponse<IDirectoryOptions[]>>(this.apiUrl, {params});
  }

  changeActiveStatus(id: string): Observable<IHttpResponse<IUserAdmin>> {
    return this.http.post<IHttpResponse<IUserAdmin>>(`${this.apiUrl}/${env.api.changeActiveStatus}/${id}`, {});
  }

  getDirectoryOptionsById(id: string): Observable<IHttpResponse<IDirectoryOptionsDetail>> {
    return this.http.get<IHttpResponse<IDirectoryOptionsDetail>>(`${this.apiUrl}/${id}`);
  }

  getDirectoryOptionsUpdateDetail(id: string): Observable<IHttpResponse<IDirectoryOptionsDetail>> {
    return this.http.get<IHttpResponse<IDirectoryOptionsDetail>>(`${this.apiUrl}/${env.api.update}/${id}`);
  }

  create(data: IDirectoryOptionsDetail): Observable<IHttpResponse<IDirectoryOptionsDetail>> {
    return this.http.post<IHttpResponse<IDirectoryOptionsDetail>>(`${this.apiUrl}/${env.api.create}`, data);
  }

  update(data: IDirectoryOptionsDetail): Observable<IHttpResponse<IDirectoryOptionsDetail>> {
    return this.http.post<IHttpResponse<IDirectoryOptionsDetail>>(`${this.apiUrl}/${env.api.update}`, data);
  }
}
