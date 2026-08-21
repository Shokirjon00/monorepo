import { InjectionToken, Type } from '@angular/core';
import { HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UploadFieldGateway {
  addFile(formData: FormData, uploadPath: string): Observable<HttpEvent<any>>;
  getContractTemplate?(): Observable<any>;
}

export const UPLOAD_FIELD_GATEWAY = new InjectionToken<UploadFieldGateway>('UPLOAD_FIELD_GATEWAY');

export interface UploadFieldDialogs {
  alert: () => Promise<Type<unknown>>;
  pdf: () => Promise<Type<unknown>>;
}

export const UPLOAD_FIELD_DIALOGS = new InjectionToken<UploadFieldDialogs>('UPLOAD_FIELD_DIALOGS');
