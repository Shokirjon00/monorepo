import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogClose, MatDialogRef } from '@angular/material/dialog';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ISelect } from '@core/interfaces/select.interface';
import { finalize, Observable, of } from 'rxjs';
import { CurrencyService } from '@core/services/currency.service';
import { BankService } from '@modules/directory/bank/services/bank.service';
import { IAccountDetail } from '@modules/client/company/interfaces/account-detail.interface';
import { AccountService } from '@core/services/account.service';
import { MessageService } from '@core/services/message.service';
import { ToastEnum } from '@eskhata/util';
import { environment as env, environment } from '@environments/environment';
import { delay, mergeMap } from 'rxjs/operators';
import { WhiteSpaceValidator } from '@core/validators/white-space-validator';
import { setValidationErrors } from '@core/validators/set-validation-errors';
import { AccountTypeID } from "./enums/account-type";
import { SvgIconComponent } from "angular-svg-icon";
import { ValidatorComponent } from "@shared/components/validator/validator.component";
import { SimpleSelectListComponent } from "@shared/components/simple-select-list/simple-select-list.component";
import { NgxMaskDirective } from "ngx-mask";
import { AutocompleteComponent } from "@shared/components/autocomplete/autocomplete.component";
import { ToastComponent } from "@shared/components/toast/toast.component";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

@Component({
  standalone: true,
  selector: 'em-account-edit-dialog',
  templateUrl: './account-edit-dialog.component.html',
  styleUrls: ['./account-edit-dialog.component.scss'],
  providers: [AccountService],
  imports: [
    ReactiveFormsModule,
    SvgIconComponent,
    MatDialogClose,
    ValidatorComponent,
    SimpleSelectListComponent,
    NgxMaskDirective,
    AutocompleteComponent,
    ToastComponent
  ]

})
export class AccountEditDialogComponent implements OnInit {
  submitted: boolean
  form: FormGroup;
  currencies: ISelect[];
  banks: ISelect[];
  accountTypes: ISelect[];
  accountDetail: IAccountDetail;
  AccountTypeID = AccountTypeID;
  api = environment.api;
  apiBanksPath = `${env.api.banks}/${env.api.dictionary}`;

  private data = inject(MAT_DIALOG_DATA);
  private dialogRef = inject(MatDialogRef<AccountEditDialogComponent>);
  private fb = inject(FormBuilder);
  private service = inject(AccountService);
  private currencyService = inject(CurrencyService);
  private messageService = inject(MessageService);
  private bankService = inject(BankService);
  private destroyRef = inject(DestroyRef);

  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  get isEditMode(): boolean {
    return !!this.accountDetail;
  }

  ngOnInit(): void {
    this.creatForm();
    this.getCurrenciesList();
  }

  onSubmit(): void {
    this.submitted = true
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.messageService.add({severity: ToastEnum.ERROR, summary: 'Неправильно заполнены данные!'});
    }

    let $observer: Observable<any>;
    this.form.get('companyId').setValue(this.data.companyId);
    if (this.data.path !== 'new') {
      $observer = this.service.updateAccount({...this.accountDetail, ...this.form.value});
    } else {
      $observer = this.service.createAccount(this.form.value);
    }

    $observer
      .pipe(
        mergeMap(res => {
          this.messageService.add({severity: res.status ? ToastEnum.SUCCESS : ToastEnum.ERROR, summary: res.message});
          return of(res).pipe(delay(res.status ? 2000 : 0))
        }),
        finalize(() => this.submitted = false),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((res) => {
        if (res.status) {
          this.form.reset();
          this.dialogRef.close(true)
        } else {
          setValidationErrors(this.form, res);
        }
      });
  }

  hideInnReceiver(): boolean {
    const type = this.form.get('accountTypeId')?.value;

    return type === AccountTypeID.POSTE_RESTANTE
      || type === AccountTypeID.TRANSIT_ACCOUNT;
  }


  private creatForm(): void {
    this.form = this.fb.group({
      name: ['', [Validators.required,
        WhiteSpaceValidator.validate(),
        Validators.maxLength(100)]],
      number: ['', [
        Validators.minLength(20),
        Validators.maxLength(20),
        Validators.required]],
      currencyId: ['', Validators.required],
      accountTypeId: ['', Validators.required],
      bankId: ['', Validators.required],
      companyId: [this.data.companyId],
      inn: ['', [Validators.minLength(9)]],
      receiver: ['', [Validators.maxLength(100)]],
    });

    this.form.get('accountTypeId').valueChanges.pipe(
      takeUntilDestroyed(this.destroyRef))
      .subscribe((accountTypeId) => {
        if (accountTypeId === AccountTypeID.TYPE_SAVING_CARD_ID) {
          this.form.get('inn').setValidators([Validators.required, Validators.minLength(9)]);
          this.form.get('receiver').setValidators([Validators.required]);
        } else {
          this.form.get('inn').clearValidators();
          this.form.get('receiver').clearValidators();
        }
        this.form.get('inn').updateValueAndValidity();
        this.form.get('receiver').updateValueAndValidity();
      });
  }

  private getCurrenciesList(): void {
    this.currencyService.getCurrenciesDictionary()
      .pipe(finalize(() => this.getBanksList()),
        takeUntilDestroyed(this.destroyRef))
      .subscribe(res => this.currencies = res.data)
  }

  private getBanksList(): void {
    this.bankService.getBankDictionary()
      .pipe(finalize(() => this.getAccountTypesList()),
        takeUntilDestroyed(this.destroyRef))
      .subscribe(res => this.banks = res.data)
  }

  private getAccountTypesList(): void {
    this.service.getTypeDictionary()
      .pipe(finalize(() => this.data.path !== 'new' && this.getDetail()),
        takeUntilDestroyed(this.destroyRef))
      .subscribe(res => this.accountTypes = res.data)
  }

  private getDetail(): void {
    this.service.getAccountDetail(this.data.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(res => {
        this.accountDetail = res.data;
        this.form.patchValue(res.data);
      });
  }
}
