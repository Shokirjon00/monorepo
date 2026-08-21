import { Component, inject, OnInit } from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {DestroyableComponent} from '@eskhata/util';
import {ISelect} from '@eskhata/util';
import {finalize, of, takeUntil} from 'rxjs';
import {MessageService} from '@eskhata/data-access';
import {ToastEnum} from '@eskhata/util';
import {environment as env, environment} from '@environments/environment';
import {delay, mergeMap} from 'rxjs/operators';
import {setValidationErrors} from '@core/validators/set-validation-errors';
import {AngularSvgIconModule} from 'angular-svg-icon';
import { AutocompleteComponent, ToastComponent, ValidatorComponent } from '@eskhata/ui';
import {CompanyService} from '@modules/client/company/services/company.service';

@Component({
  standalone: true,
  selector: 'em-company-acquirer-create-dialog',
  templateUrl: './company-acquirer-create-dialog.component.html',
  imports: [
    AngularSvgIconModule,
    ReactiveFormsModule,
    MatDialogModule,
    ValidatorComponent,
    ToastComponent,
    AutocompleteComponent
  ],
  styleUrls: ['./company-acquirer-create-dialog.component.scss'],
  providers: [CompanyService]
})
export class CompanyAcquirerCreateDialogComponent extends DestroyableComponent implements OnInit {
  submitted: boolean
  form: FormGroup;
  banks: ISelect[];
  api = environment.api;
  apiBanksPath = `${env.api.banks}/${env.api.dictionary}`;
  apiGatewaysPath = `${env.api.gateways}/${env.api.dictionary}`;

  private readonly data = inject(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<CompanyAcquirerCreateDialogComponent>);
  private readonly fb = inject(FormBuilder);
  private readonly messageService = inject(MessageService);
  private readonly service = inject(CompanyService);

  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  ngOnInit(): void {
    this.creatForm();
  }

  onSubmit(): void {
    this.submitted = true
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.messageService.add({severity: ToastEnum.ERROR, summary: 'Неправильно заполнены данные!'});
    }
    this.service.createCompanyAcquirer(this.form.value)
      .pipe(
        mergeMap(res => {
          this.messageService.add({severity: res.status ? ToastEnum.SUCCESS : ToastEnum.ERROR, summary: res.message});
          return of(res).pipe(delay(res.status ? 2000 : 0))
        }),
        finalize(() => this.submitted = false),
        takeUntil(this.destroyed$)
      )
      .subscribe(res => {
        if (res.status) {
          this.form.reset();
          this.dialogRef.close(true)
        } else {
          setValidationErrors(this.form, res);
          if (res?.errors?.requestError) {
            this.messageService.add({severity: ToastEnum.ERROR, summary: res.errors.requestError});
          }
        }
      });
  }

  private creatForm(): void {
    this.form = this.fb.group({
      companyId: [this.data.companyId],
      bankId: ['', [Validators.required]],
      gatewayId: ['', [Validators.required]],
    });
  }
}
