import { inject, Injectable } from '@angular/core';
import { environment as env } from "@environments/environment";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Params } from "@angular/router";
import { Observable } from "rxjs";
import { IHttpResponse } from "@core/interfaces/http-response.interface";
import { IDepartmentCode } from "@modules/directory/departament-code/interfaces/department-code";
import { IDepartmentCodeDetail } from "@modules/directory/departament-code/interfaces/department-code-detail";
import { ISelect } from "@core/interfaces";

@Injectable()
export class DepartmentCode {
  private apiUrl = `${env.apiUrl}/${env.api.merchantGovernmentDepartments}`;
  private http = inject(HttpClient)


  getDepartmentCode(queryParams: Params): Observable<IHttpResponse<IDepartmentCode[]>> {
    const params = new HttpParams({fromObject: queryParams});
    return this.http.get<IHttpResponse<IDepartmentCode[]>>(this.apiUrl, {params});
  }

  getDepartmentCodeDetail(id: string): Observable<IHttpResponse<IDepartmentCodeDetail>> {
    return this.http.get<IHttpResponse<IDepartmentCodeDetail>>(`${this.apiUrl}/${env.api.update}/${id}`);
  }

  updateDepartmentCode(data: any): Observable<IHttpResponse<IDepartmentCodeDetail>> {
    return this.http.post<IHttpResponse<IDepartmentCodeDetail>>(`${this.apiUrl}/${env.api.update}`, data);
  }

  createDepartmentCode(data: any): Observable<IHttpResponse<IDepartmentCodeDetail>> {
    return this.http.post<IHttpResponse<IDepartmentCodeDetail>>(`${this.apiUrl}/${env.api.create}`, data);
  }

  getDepartmentDictionary(): Observable<IHttpResponse<ISelect[]>> {
    return this.http.get<IHttpResponse<ISelect[]>>(`${this.apiUrl}/${env.api.dictionary}`);
  }
}
