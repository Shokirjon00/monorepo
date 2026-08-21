import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MerchantService } from '@modules/merchant-container/merchant/services/merchant.service';
import { MessageService } from '@eskhata/data-access';
import { ToastEnum, WhiteSpaceValidator } from '@eskhata/util';
import { Location } from '@angular/common';
import { finalize, of } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SvgIconComponent } from 'angular-svg-icon';
import { AutocompleteComponent, EmHeaderComponent, EskhataBankLoaderComponent, ToastModule, ValidatorModule } from '@eskhata/ui';
import { SharedModule } from '@shared/shared.module';
import { NgxMaskDirective } from 'ngx-mask';
import { environment as env } from '@environments/environment';
import { AccountService } from '@modules/merchant-container/account/services/account.service';
import { delay, mergeMap } from 'rxjs/operators';
import { setValidationErrors } from '@core/validators/set-validation-errors';

@Component({
  standalone: true,
  selector: 'em-merchant-application-add',
  templateUrl: './merchant-application-add.component.html',
  styleUrls: ['./merchant-application-add.component.scss'],
  imports: [
    ReactiveFormsModule,
    SvgIconComponent,
    ValidatorModule,
    SharedModule,
    EskhataBankLoaderComponent,
    ToastModule,
    EmHeaderComponent,
    NgxMaskDirective,
    AutocompleteComponent,
  ],
  providers: [MerchantService, AccountService],
})
export class MerchantApplicationAddComponent implements OnInit {
  submitted = false;
  form: FormGroup;

  readonly requisitesApi = `${env.api.accounts}/${env.api.requisites}/${env.api.dictionary}`;

  private readonly fb = inject(FormBuilder);
  private readonly service = inject(MerchantService);
  private readonly messageService = inject(MessageService);
  private readonly location = inject(Location);
  private readonly destroyRef = inject(DestroyRef);

  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  ngOnInit(): void {
    this.createForm();
  }

  onSubmit(): void {
    this.form.markAllAsTouched();

    if (this.form.invalid) {
      this.showErrorToast();
      return;
    }

    this.submitted = true;
    if (this.form.invalid) {
      this.messageService.add({ severity: ToastEnum.ERROR, summary: 'Неправильно заполнены данные!' });
      return null;
    }
    this.submitted = true;

    this.service
      .createMerchantApplications(this.form.value)

      .pipe(
        mergeMap(res => {
          this.messageService.add({ severity: res.status ? ToastEnum.SUCCESS : ToastEnum.ERROR, summary: res.message });
          return of(res).pipe(delay(res.status ? 2000 : 0));
        }),
        finalize(() => (this.submitted = false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(res => {
        if (res.status) {
          this.form.reset();
          this.back();
        } else {
          setValidationErrors(this.form, res);
        }
      });
  }

  showErrorToast(): void {
    this.messageService.add({
      severity: ToastEnum.ERROR,
      summary: 'Неправильно заполнены данные!',
    });
  }

  back(): void {
    this.location.back();
  }

  onPhoneFocus(): void {
    const value = this.form.get('managerPhoneNumber')?.value;
    if (!value) {
      this.form.get('managerPhoneNumber')?.setValue('+992 ');
    }
  }

  private createForm(): void {
    this.form = this.fb.group({
      name: [
        '',
        [Validators.required, WhiteSpaceValidator.validate(), Validators.minLength(3), Validators.maxLength(100)],
      ],
      description: ['', Validators.maxLength(1000)],
      address: ['', Validators.required],
      managerFullName: ['', Validators.required],
      managerPhoneNumber: ['', Validators.required],
      email: ['', Validators.email],
      paymentAccountId: ['', Validators.required],
      posCount: ['', Validators.required],
      qrCount: ['', Validators.required],
    });
  }
}
