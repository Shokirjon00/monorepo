import {inject, Injectable} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {Observable, Subject} from 'rxjs';
import {AlertDialogComponent} from '@shared/dialogs/alert-dialog/alert-dialog.component';

export interface ErrorDialogInterface {
  title?: string;
  body?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ErrorService {
  hasDialog: boolean;
  show$ = new Subject<ErrorDialogInterface>();
  private dialog = inject(MatDialog);

  showAlert(params: any, width: string = '90vw'): Observable<any> {
    return this.dialog.open(AlertDialogComponent, {
      disableClose: true,
      data: params,
      maxWidth: width
    }).afterClosed();
  }
}
