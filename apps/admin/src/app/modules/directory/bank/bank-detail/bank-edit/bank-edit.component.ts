import { finalize, Observable, of, takeUntil } from 'rxjs';
import { Component, DestroyRef, inject, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IBankDetail } from '@modules/directory/bank/interfaces/bank-detail.intefrace';
import { BankService } from '@modules/directory/bank/services/bank.service';
import { Location } from '@angular/common';
import { MessageService } from '@core/services/message.service';
import { ToastEnum, WhiteSpaceValidator } from '@eskhata/util';
import { delay, mergeMap } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { setValidationErrors } from '@core/validators/set-validation-errors';
import { EMBaseForm } from '@core/abstract/base-form.abstract';
import { IParam } from '@core/interfaces/param.interface';
import { SvgIconComponent } from "angular-svg-icon";
import { NgxPermissionsModule } from "ngx-permissions";
import { ValidatorComponent } from "@shared/components/validator/validator.component";
import { EbLoaderComponent } from "@shared/components/eb-loader/eb-loader.component";
import { ToastComponent } from "@shared/components/toast/toast.component";
import { EmHeaderComponent } from "@shared/components/em-header/em-header.component";
import { AutocompleteComponent } from "@shared/components/autocomplete/autocomplete.component";
import { environment as env } from "@environments/environment";
import { CompanyService } from "@modules/client/company/services/company.service";
import { UploadLogoComponent } from "@shared/components/upload-logo/upload-logo.component";
import { IHttpResponse } from "@core/interfaces/http-response.interface";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { BankConstants } from "@modules/directory/bank/bank.constants";

@Component({
  standalone: true,
  selector: 'em-bank-edit',
  templateUrl: './bank-edit.component.html',
  styleUrls: ['./bank-edit.component.scss'],
  providers: [BankService, CompanyService],
  imports: [
    ReactiveFormsModule,
    SvgIconComponent,
    NgxPermissionsModule,
    ValidatorComponent,
    EbLoaderComponent,
    ToastComponent,
    EmHeaderComponent,
    AutocompleteComponent,
    UploadLogoComponent
  ]
})
export class BankEditComponent extends EMBaseForm implements OnInit {
  uploadFile: any;
  fileStorageUrl?: string;
  fileStorageToken?: string;
  form: FormGroup;
  customLogoKey: string = 'icon';
  bankDetail: IBankDetail;
  submitted: boolean = false;
  getBankTypes = `${env.api.bankTypes}/${env.api.dictionary}`;
  private readonly bankId: string;
  private readonly updateUrl: string;
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  private readonly bankService = inject(BankService);
  private readonly messageService = inject(MessageService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);

  constructor(
    location: Location,
    dialog: MatDialog,
  ) {
    super(location, dialog);
    this.bankId = this.activatedRoute.snapshot.params['id'];
    this.updateUrl = this.activatedRoute.snapshot.routeConfig.path;
  }

  @Input() set data(value: IParam) {
    this.dataSource = value;
  }

  ngOnInit(): void {
    this.uploadFile = this.uploadLogo.bind(this);
    this.creatForm();
    this.subscribeBankTypeChanges();
    if (this.updateUrl !== 'new') {
      this.loadBankDetail();
    }
  }

  onSubmit(): void {
    this.form.markAllAsTouched();
    this.form.updateValueAndValidity({ onlySelf: false, emitEvent: false });
    if (this.form.invalid) {
      this.messageService.add({severity: ToastEnum.ERROR, summary: 'Неправильно заполнены данные!'});
      return null;
    }
    this.submitted = true;

    let $observer: Observable<any>;
    this.form = this.setDefaultValue(this.form)
    if (this.updateUrl !== 'new') {
      $observer = this.bankService.update({...this.bankDetail, ...this.form.value});
    } else {
      $observer = this.bankService.create(this.form.value);
    }

    $observer
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
          this.router.navigate(['directory/bank']).catch();
        } else {
          setValidationErrors(this.form, res);
        }
      });
  }

  uploadLogo(file: FormData): Observable<IHttpResponse<IBankDetail>> {
    return this.bankService.uploadLogo(file);
  }

  private creatForm(): void {
    this.form = this.fb.group({
      id: [this.bankId],
      bankTypeId: ['', Validators.required],
      inn: ['', [Validators.minLength(9), Validators.maxLength(9), Validators.required]],
      ein: ['', [Validators.maxLength(15), Validators.required]],
      name: ['', [Validators.required,
        WhiteSpaceValidator.validate(),
        Validators.maxLength(100)]],
      extCodeAbs: [''],
      extCodeEqms: [''],
      bic: ['', [
        Validators.minLength(9),
        Validators.maxLength(9)]],
      bicEqms: ['', [
        Validators.maxLength(15)]],
      correspondentAccountNumber: ['', [
        Validators.minLength(20),
        Validators.maxLength(20)]],
      creditAccountAbsCode: ['', Validators.maxLength(20)],
      debitAccountAbsCode: ['', Validators.maxLength(20)],
      correspondentAccountNumberEqms: ['', [
        Validators.maxLength(20)]],
      position: ['', Validators.required],
      priority: ['', Validators.required],
      address: [''],
      canRefund: [false],
      iconFileStorageId: '',
      isActive: [false]
    });
  }

  private subscribeBankTypeChanges(): void {
    this.form.get('bankTypeId')?.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.clearServerErrors());
  }

  private clearServerErrors(): void {
    const formErrors = this.form.errors;
    if (formErrors?.['serverError']) {
      const { serverError, ...rest } = formErrors;
      this.form.setErrors(Object.keys(rest).length ? rest : null);
    }

    Object.entries(this.form.controls).forEach(([, control]) => {
      if (!control) return;

      const errors = control.errors;
      if (!errors || !errors['serverErrors']) return;

      const { serverErrors, ...rest } = errors;
      control.setErrors(Object.keys(rest).length ? rest : null);
    });
  }

  private loadBankDetail(): void {
    this.bankService.getBankDetail(this.bankId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(res => {
        if (res.status){
          this.bankDetail = res.data;
          this.fileStorageUrl = res.meta.fileStorageUrl;
          this.fileStorageToken = res.meta.fileStorageToken;
          this.dataSource = res.data;
          this.form.patchValue(res.data);
        }
      });
  }
}
