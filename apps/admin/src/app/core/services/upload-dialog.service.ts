import { inject, Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { IHttpResponse } from "@core/interfaces/http-response.interface";
import { IUpdateDialog } from "@shared/dialogs/update-dialog/interface/update-dialog";

@Injectable({
  providedIn: 'root'
})
export class UploadDialogService {
  private http = inject(HttpClient);

  getNewFeatures(): Observable<IHttpResponse<IUpdateDialog>> {
    return this.http.get<IHttpResponse<IUpdateDialog>>(`/assets/data.json`);
  }
}
