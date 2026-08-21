import { Component, DestroyRef, inject, Inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MultiSelectListComponent } from '@eskhata/ui';
import { NgxPermissionsModule } from 'ngx-permissions';
import { MAT_DIALOG_DATA, MatDialogClose, MatDialogRef } from '@angular/material/dialog';
import { ToastEnum } from '@eskhata/util';
import { SharedModule } from '@shared/shared.module';
import { RetailOutletService } from '@modules/company-registration/retail-outlet/services/retail-outlet.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IRetailOutletChangeStatus } from '@modules/company-registration/retail-outlet/interfaces/retail-outlet.interfaces';
import { MessageService } from '@core/services';
import { finalize } from 'rxjs/operators';

@Component({
  standalone: true,
  selector: 'em-retail-outlet-dialog',
  templateUrl: './retail-outlet-dialog.component.html',
  styleUrls: ['./retail-outlet-dialog.component.scss'],
  imports: [
    ReactiveFormsModule,
    SharedModule,
    NgxPermissionsModule,
    MatDialogClose,
  ]
})
export class RetailOutletDialogComponent {
  form: FormGroup;
  status: IRetailOutletChangeStatus[];

  submitted = signal(false);

  private destroyRef = inject(DestroyRef);
  private service = inject(RetailOutletService);
  private messageService = inject(MessageService);
  private dialogRef = inject(MatDialogRef<RetailOutletDialogComponent>);

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { id: string; path?: string }
  ) {
    this.initForm(data.id);
    this.getStatus();
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.messageService.add({
        severity: ToastEnum.ERROR,
        summary: 'Неправильно заполнены данные!'
      });
      return;
    }

    this.submitted.set(true);

    const payload = this.form.value;

    this.service.sendStatus(payload)
      .pipe(
        finalize(() => this.submitted.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(res => {
        this.messageService.add({
          severity: res.status ? ToastEnum.SUCCESS : ToastEnum.ERROR,
          summary: res.message
        });

        if (res.status) {
          this.dialogRef.close(true);
          this.form.reset();
        }
      });
  }

  private initForm(id: string): void {
    this.form = new FormGroup({
      id: new FormControl(id),
      comment: new FormControl(''),
      merchantApplicationStatusId: new FormControl('', Validators.required)
    });
  }

  private getStatus(): void {
    this.service.changeStatus()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(res => {
        if (res.status) {
          this.status = res.data
        }
      });
  }
}
