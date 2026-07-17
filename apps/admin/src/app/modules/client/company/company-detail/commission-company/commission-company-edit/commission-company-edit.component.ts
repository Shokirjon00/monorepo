import { Component, DestroyRef, inject, Input, OnInit, signal, WritableSignal } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ISelect } from '@core/interfaces/select.interface';
import { DatePipe, Location, CommonModule } from '@angular/common';
import { Observable, of, Subject } from 'rxjs';
import { CashbackRatesService } from '@modules/directory/cashback-rates/services/cashback-rates.service';
import { ActivatedRoute } from '@angular/router';
import { IFilterParams } from '@core/interfaces/filter-params.interface';
import { MerchantService } from '@modules/client/merchant/services/merchant.service';
import { ToastEnum } from '@eskhata/util';
import { MessageService } from '@core/services/message.service';
import { HeaderService } from '@core/services/header.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '@shared/dialogs/confirm-dialog/confirm-dialog.component';
import { delay, mergeMap } from 'rxjs/operators';
import { CashbackAccrualTypesServices } from '@modules/bank-promotion/services/cashback-accrual-types.services';
import { SelectPeriodDialogComponent } from '@shared/dialogs/select-period-dialog/select-period-dialog.component';
import { DateFormatEnum } from '@core/enums/date-format.enum';
import { SvgIconComponent } from "angular-svg-icon";
import { NgxPermissionsModule } from "ngx-permissions";
import { SimpleSelectListComponent } from "@shared/components/simple-select-list/simple-select-list.component";
import { ValidatorComponent } from "@shared/components/validator/validator.component";
import { ToastComponent } from "@shared/components/toast/toast.component";
import { EmHeaderComponent } from "@shared/components/em-header/em-header.component";
import { CommissionCompanyService } from "@modules/client/company/company-detail/commission-company/services/commission-company.service";
import { ICommissionCompanyEdit } from "@modules/client/company/company-detail/commission-company/interfaces/commission-company.interface";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { AutocompleteComponent } from "@shared/components/autocomplete/autocomplete.component";
import { environment as env } from "@environments/environment";

@Component({
  standalone: true,
  selector: 'em-commission-company-edit',
  templateUrl: './commission-company-edit.component.html',
  styleUrls: ['./commission-company-edit.component.scss'],
  providers: [
    MerchantService,
    CashbackAccrualTypesServices,
    CashbackRatesService,
    CommissionCompanyService,
    DatePipe
  ],
  imports: [
    ReactiveFormsModule,
    SvgIconComponent,
    NgxPermissionsModule,
    SimpleSelectListComponent,
    ValidatorComponent,
    ToastComponent,
    EmHeaderComponent,
    AutocompleteComponent,
    CommonModule
  ]
})

export class CommissionCompanyEditComponent implements OnInit {
  @Input() uploadFile = {fileType: '.jpg, .jpeg', memType: 'application/pdf', uploadPath: 'cashback_companies/upload'};
  companyId: string;
  cashbackCompanyId: string;
  form: FormGroup;
  companyCommission = `${env.api.commissions}/${env.api.dictionary}`
  apiBanksPath = `${env.api.banks}/${env.api.dictionary}`;
  companyCommissionType: ISelect[];
  merchants: ISelect[];
  commissionDetail: ICommissionCompanyEdit;

  private queryParams: IFilterParams = { filters: '' };
  private canDeactivate$ = new Subject<boolean>();
  private readonly destroyRef = inject(DestroyRef);
  private readonly location = inject(Location);
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(CommissionCompanyService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly merchantService = inject(MerchantService);
  private readonly messageService = inject(MessageService);
  private readonly datePipe = inject(DatePipe);
  private readonly store = inject(HeaderService);
  private readonly dialog = inject(MatDialog);
  private readonly updateUrl = this.activatedRoute.snapshot.routeConfig.path;
  readonly isMerchantsReadOnly = signal(false);
  readonly bankCommissionsSignal: WritableSignal<{ bankId: string; commissionId: string }[]> = signal([]);

  constructor() {
    this.cashbackCompanyId = this.activatedRoute.snapshot.params['id'];
    this.initData();
  }

  get getMerchantsArray(): FormArray {
    return this.form.get('merchants') as FormArray;
  }

  get bankCommissionsFormArray(): FormArray {
    return this.form.get('bankCommissions') as FormArray;
  }

  get isPeriodDisabled(): boolean {
    return this.form.get('startDate')?.disabled || this.form.get('endDate')?.disabled;
  }

  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  ngOnInit(): void {
    this.creatForm();
    this.getCompanyCommissionType();
    this.getMerchants();
    this.bankCommissionsFormArray.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(val => {
        this.bankCommissionsSignal.set(val);
        this.validateDuplicateBanks();
      });

    if (this.updateUrl === 'new') {
      this.addBankCommission();
    }
    if (this.updateUrl !== 'new') {
      this.getDetail();
    }
  }

  onSubmit(): void {
    const value = this.form.getRawValue();

    if (!this.isFormValid(value)) {
      return;
    }

    this.sendForm();
  }

  canDeactivate(): Observable<boolean> {
    if (!this.hasChanges()) {
      return of(true);
    }

    this.dialog.open(ConfirmDialogComponent, {
      disableClose: true,
      panelClass: 'custom-modalbox',
      data: {
        title: 'Данные будут утеряны. Вы действительно хотите покинуть страницу?',
        successButtonText: 'Да',
        cancelButtonText: 'Нет'
      },
      maxWidth: '90vw'
    })
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(res => this.canDeactivate$.next(res));

    return this.canDeactivate$;
  }

  back(): void {
    this.location.back();
  }

  getPeriodTime(startDate: string, endDate: string): void {
    this.dialog.open(SelectPeriodDialogComponent, {
      disableClose: true,
      data: {
        start: this.form.get(startDate).value,
        end: this.form.get(endDate).value,
      },
      panelClass: 'date-picker',
    })
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(res => {
        if (res) {
          this.form.controls[startDate].setValue(res.start.format(DateFormatEnum.YEAR_DATE_LOCAL_FORMAT))
          this.form.controls[endDate].setValue(res.end.format(DateFormatEnum.YEAR_DATE_LOCAL_FORMAT))
          this.form.updateValueAndValidity();
        }
      });
  }

  merchantSelect(id: string): void {
    const checkId = this.getMerchantsArray.value.findIndex((item: string) => item === id);
    if (checkId !== -1) {
      this.getMerchantsArray.removeAt(checkId);
    } else {
      const data = this.fb.control('');
      data.setValue(id);
      this.getMerchantsArray.push(data);
    }
  }

  addBankCommission(data?: { bankId?: string; commissionId?: string }): void {
    this.bankCommissionsFormArray.push(this.createBankCommissionGroup(data));
    this.bankCommissionsSignal.set(this.bankCommissionsFormArray.value);
  }

  removeBankCommission(index: number): void {
    this.bankCommissionsFormArray.removeAt(index);
    this.bankCommissionsSignal.set(this.bankCommissionsFormArray.value);
  }

  private createBankCommissionGroup(data?: { bankId?: string; commissionId?: string }): FormGroup {
    return this.fb.group({
      bankId: data?.bankId,
      commissionId: data?.commissionId
    }, { validators: this.bankCommissionGroupValidator });
  }

  private bankCommissionGroupValidator(group: AbstractControl): { [key: string]: any } | null {
    const bank = group.get('bankId')?.value;
    const commission = group.get('commissionId')?.value;
    if ((!bank || bank === '') && (!commission || commission === '')) return null;
    if (bank && commission) return null;
    return { partial: true };
  }

  private isFormValid(value: any): boolean {
    if (!value.commissionId && !value.commissionId) {
      this.messageService.add({severity: ToastEnum.WARN, summary: 'Укажите процент для данной комиссии!'});
      return false;
    }

    if (value.commissionId && (!value.startDate || !value.endDate)) {
      this.messageService.add({severity: ToastEnum.WARN, summary: 'Укажите период действия комиссии от мерчанта!'});
      return false;
    }

    if (value.commissionId && (value.startDate > value.endDate)) {
      this.messageService.add({
        severity: ToastEnum.WARN,
        summary: 'Начальный период не может быть больше конечной для комиссии от мерчанта!'
      });
      return false;
    }

    this.form.markAllAsTouched();
    const hasPartial = this.bankCommissionsFormArray.controls.some((g: AbstractControl) => !!g.errors?.['partial']);
    if (hasPartial) {
      this.messageService.add({severity: ToastEnum.ERROR, summary: 'Заполните оба поля в карточке банковской комиссии или удалите пустую карточку.'});
      return false;
    }

    if (this.form.invalid) {
      this.messageService.add({severity: ToastEnum.ERROR, summary: 'Неправильно заполнены данные!'});
      return false;
    }

    return true;
  }

  private sendForm(): void {
    this.form.get('companyId').setValue(this.companyId);
    const raw = this.form.getRawValue();
    raw.bankCommissions = (raw.bankCommissions || []).filter((b: any) => b && b.bankId && b.commissionId);

    const request$: Observable<any> = this.updateUrl !== 'new'
      ? this.service.updateCommission({...this.commissionDetail, ...raw})
      : this.service.createCommission(raw);

    request$
      .pipe(
        mergeMap(res => {
          this.messageService.add({
            severity: res.status ? ToastEnum.SUCCESS : ToastEnum.ERROR,
            summary: res.message
          });
          return of(res).pipe(delay(res.status ? 2000 : 0));
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (res) => {
          if (res.status) {
            this.handleSuccess();
          } else {
            this.handleError(res);
          }
        }
      });
  }

  private handleSuccess(): void {
    this.form.reset();
    this.location.back();
  }

  private handleError(res: any): void {
    this.setFormErrorsFromResponse(res);
    this.messageService.add({
      severity: ToastEnum.WARN,
      summary: res.errors?.requestError?.[0] || res.message
    });
  }

  private setFormErrorsFromResponse(res: any): void {
    if (res.errors) {
      this.processBankCommissionsErrors(res.errors);
      this.processFieldErrors(res.errors);
    }
  }

  private processBankCommissionsErrors(errors: any): void {
    if (!errors.bankCommissions) return;

    const bc = errors.bankCommissions;
    const arr = this.form.get('bankCommissions') as FormArray;

    if (Array.isArray(bc)) {
      bc.forEach((item: any, idx: number) => this.setBankCommissionError(arr, idx, item));
    } else if (bc && typeof bc === 'object') {
      Object.entries(bc).forEach(([idxKey, item]: [string, any]) => {
        const idx = Number(idxKey);
        this.setBankCommissionError(arr, idx, item);
      });
    }
  }

  private setBankCommissionError(arr: FormArray, idx: number, item: any): void {
    if (!arr || !arr.at(idx)) return;

    if (typeof item === 'string' || Array.isArray(item)) {
      arr.at(idx).setErrors({ serverErrors: Array.isArray(item) ? item : [item] });
    } else if (item && typeof item === 'object') {
      Object.entries(item).forEach(([fieldKey, messages]: [string, any]) => {
        const controlKey = fieldKey.charAt(0).toLowerCase() + fieldKey.slice(1);
        const control = arr.at(idx).get(controlKey);
        if (control) {
          control.setErrors({ serverErrors: messages });
        } else {
          arr.at(idx).setErrors({ serverErrors: messages });
        }
      });
    }
  }

  private processFieldErrors(errors: any): void {
    Object.entries(errors).forEach(([key, value]: [string, any]) => {
      const match = key.match(/([A-Za-z0-9_]+)\[(\d+)\]\.?(\w+)/);
      if (match) {
        const [, arrName, indexStr, fieldName] = match;
        const index = Number(indexStr);

        if (arrName === 'bankCommissions') {
          const arr = this.form.get('bankCommissions') as FormArray;
          if (arr && arr.at(index)) {
            const controlKey = fieldName.charAt(0).toLowerCase() + fieldName.slice(1);
            const control = arr.at(index).get(controlKey);
            if (control) {
              control.setErrors({ serverErrors: value });
            } else {
              arr.at(index).setErrors({ serverErrors: value });
            }
          }
        }
      }
    });
  }

  private creatForm(): void {
    this.form = this.fb.group({
      id: [],
      startDate: [null, Validators.pattern('^(19[0-9]{2}|2[0-9]{3})-(0[1-9]|1[012])-([123]0|[012][1-9]|31)$')],
      endDate: [null, Validators.pattern('^(19[0-9]{2}|2[0-9]{3})-(0[1-9]|1[012])-([123]0|[012][1-9]|31)$')],
      commissionId: ['', Validators.required],
      description: [''],
      companyId: [this.companyId],
      commissionTypeId: ['', Validators.required],
      isActive: [false],
      merchants: this.fb.array([], [Validators.required]),
      bankCommissions: this.fb.array([]),
      isEWalletCommissionCancelled: [false]
    });
  }

  private getCompanyCommissionType(): void {
    this.service.getCommissionTypeDictionary()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(res => this.companyCommissionType = res.data);
  }

  private getMerchants(): void {
    this.queryParams.filters = `companyId==${this.companyId}`;
    this.merchantService.getMerchantsWithoutPagination(this.queryParams)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(res => {
        this.merchants = res.data;
      });
  }

  private getDetail(): void {
    this.service.getCommissionCompanyDetail(this.cashbackCompanyId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(res => {
        const data = this.prepareCommissionData(res.data);
        this.commissionDetail = data;
        this.patchForm(data);
        this.updateMerchants(data.merchants);
        this.updateBankCommissions(data.bankCommissions);
        this.applyFormAccessibility(data.isFullyEditable);
      });
  }

  private addControlServerError(control: AbstractControl, message: string): void {
    if (!control) return;
    const errs = control.errors ? {...control.errors} : {};
    const arr: string[] = errs['serverErrors'] ? [...errs['serverErrors']] : [];
    if (!arr.includes(message)) arr.push(message);
    errs['serverErrors'] = arr;
    control.setErrors(errs);
  }

  private removeControlServerError(control: AbstractControl, message: string): void {
    if (!control || !control.errors) return;
    const errs = {...control.errors};
    const arr: string[] = errs['serverErrors'] ? [...errs['serverErrors']] : [];
    const filtered = arr.filter(m => m !== message);
    if (filtered.length) {
      errs['serverErrors'] = filtered;
      control.setErrors(errs);
    } else {
      delete errs['serverErrors'];
      if (Object.keys(errs).length === 0) {
        control.setErrors(null);
      } else {
        control.setErrors(errs);
      }
    }
  }

  private validateDuplicateBanks(): void {
    const controls = this.bankCommissionsFormArray.controls;
    const firstIndex = new Map<string, number>();
    const DUP_MSG = 'Банк уже выбран в другой карточке';
    controls.forEach((c, idx) => {
      const val = c.get('bankId')?.value;
      if (val) {
        const key = String(val);
        if (!firstIndex.has(key)) {
          firstIndex.set(key, idx);
        }
      }
    });

    controls.forEach((c, idx) => {
      const val = c.get('bankId')?.value;
      const control = c.get('bankId');
      if (val) {
        const key = String(val);
        const first = firstIndex.get(key);
        if (first !== undefined && first !== idx) {
          this.addControlServerError(control, DUP_MSG);
        } else {
          this.removeControlServerError(control, DUP_MSG);
        }
      } else {
        this.removeControlServerError(control, DUP_MSG);
      }
    });
  }

  private updateBankCommissions(items: any[] = []): void {
    if (!items || !items.length) {
      this.addBankCommission();
      return;
    }

    items.forEach((it: any) => {
      const bankVal = it?.bankId ?? it?.bankName ?? it?.bank?.name ?? '';
      const commissionVal = it?.commissionId ?? it?.commissionName ?? it?.commission?.name ?? '';
      this.bankCommissionsFormArray.push(this.createBankCommissionGroup({ bankId: bankVal, commissionId: commissionVal }));
    });
    this.bankCommissionsSignal.set(this.bankCommissionsFormArray.value);
    this.validateDuplicateBanks();
  }

  private prepareCommissionData(data: ICommissionCompanyEdit): ICommissionCompanyEdit {
    return {
      ...data,
      startDate: this.datePipe.transform(data.startDate, DateFormatEnum.YEAR_DATE_FORMAT),
      endDate: this.datePipe.transform(data.endDate, DateFormatEnum.YEAR_DATE_FORMAT),
    };
  }

  private patchForm(data: ICommissionCompanyEdit): void {
    this.form.patchValue(data);
  }

  private updateMerchants(merchantIds: string[]): void {
    merchantIds.forEach(id => this.getMerchantsArray.push(this.fb.control(id)));
    this.merchants?.forEach(merchant => {
      merchant.isActive = merchantIds.includes(merchant.id);
    });
  }

  private applyFormAccessibility(isEditable: boolean): void {
    if (!isEditable) {
      this.form.get('startDate')?.disable();
      this.form.get('commissionId')?.disable();
      this.form.get('description')?.disable();
      this.form.get('commissionTypeId')?.disable();
      this.isMerchantsReadOnly.set(true);
    }
  }


  private hasChanges(): boolean {
    if (!this.form) {
      return false;
    }
    const hasChanges = Object.values(this.form.value).some(item => !!item);
    return this.form.dirty && hasChanges && this.form.touched;
  }

  private initData(): void {
    this.store.getCompanyId()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(companyId => this.companyId = companyId);
  }
}
