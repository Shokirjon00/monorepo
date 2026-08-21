import { DestroyableComponent } from '@eskhata/util';
import { Location } from '@angular/common';
import { Observable, of, Subject, takeUntil } from 'rxjs';
import { ConfirmDialogComponent } from '@shared/dialogs/confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { compareForm } from '@core/utils/compare-form';
import { AbstractControl, FormGroup } from '@angular/forms';
import { IParam } from '@eskhata/util';
import { switchMap } from "rxjs/operators";

export abstract class EMBaseForm extends DestroyableComponent {
  private _dataSource: IParam;
  private canDeactivate$ = new Subject<boolean>();

  protected abstract form: FormGroup;

  protected constructor(protected readonly location: Location,
                        protected readonly dialog: MatDialog) {
    super();
  }

  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  get dataSource(): IParam {
    return this._dataSource;
  }

  set dataSource(value: IParam) {
    if (value) {
      this._dataSource = value;
    }
  }

  back(): void {
    this.location.back();
  }

  canDeactivate(): Observable<boolean> {
    if (!this.hasChanges()) {
      return of(true);
    }

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      disableClose: true,
      panelClass: 'custom-modalbox',
      maxWidth: 500,
      data: {
        title: 'Данные будут утеряны. Вы действительно хотите покинуть страницу?',
        successButtonText: 'Да',
        cancelButtonText: 'Нет'
      }
    });

    return dialogRef.afterClosed().pipe(
      takeUntil(this.destroyed$),
      switchMap(result => {
        if (result) {
          this.canDeactivate$.next(true);
          return of(true);
        } else {
          this.canDeactivate$.next(false);
          return of(false);
        }
      })
    );
  }

  setDefaultValue(form: FormGroup): FormGroup {
    Object.keys(form.controls).forEach(key => {
      const control = form.get(key);
      if (control.value === '') {
        control.setValue(null);
      }
    });
    return form
  }

  private hasChanges(): boolean {
    if (!this.form) {
      return false;
    }
    const hasChanges = Object.values(this.form.value).some(item => !!item);
    return this.form.dirty && hasChanges && compareForm(this._dataSource, this.form.value) && this.form.touched;
  }

}
