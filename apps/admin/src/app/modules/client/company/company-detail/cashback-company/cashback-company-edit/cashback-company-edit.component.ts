import {Component, DestroyRef, inject, Input, OnInit} from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ISelect } from '@core/interfaces/select.interface';
import {DatePipe, Location} from '@angular/common';
import { Observable, of, Subject, takeUntil } from 'rxjs';
import { DestroyableComponent } from '@core/abstract/destroyable.component';
import { CashbackRatesService } from '@modules/directory/cashback-rates/services/cashback-rates.service';
import { ActivatedRoute, Params } from '@angular/router';
import { IFilterParams } from '@core/interfaces/filter-params.interface';
import { MerchantService } from '@modules/client/merchant/services/merchant.service';
import { ToastEnum } from '@core/enums/toast-enum';
import { MessageService } from '@core/services/message.service';
import { HeaderService } from '@core/services/header.service';
import { IHeader } from '@core/interfaces/header.interface';
import { DataTimeComponent } from '@shared/components/data-time/data-time.component';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '@shared/dialogs/confirm-dialog/confirm-dialog.component';
import {
  ICashbackCompany
} from '@modules/client/company/company-detail/cashback-company/interfaces/cashback-company.interface';
import {
  CashbackCompanyService
} from '@modules/client/company/company-detail/cashback-company/services/cashback-company.service';
import { delay, mergeMap } from 'rxjs/operators';
import { CashbackAccrualTypesServices } from '@modules/bank-promotion/services/cashback-accrual-types.services';
import { setValidationErrors } from '@core/validators/set-validation-errors';
import { SelectPeriodDialogComponent } from '@shared/dialogs/select-period-dialog/select-period-dialog.component';
import { DeepClone } from '@core/utils/deep-clone';
import { DateFormatEnum } from '@core/enums/date-format.enum';
import { SvgIconComponent } from "angular-svg-icon";
import { NgxPermissionsModule } from "ngx-permissions";
import { SimpleSelectListComponent } from "@shared/components/simple-select-list/simple-select-list.component";
import { ValidatorComponent } from "@shared/components/validator/validator.component";
import { UploadFieldComponent } from "@shared/components/upload-field/upload-field.component";
import { ToastComponent } from "@shared/components/toast/toast.component";
import { EmHeaderComponent } from "@shared/components/em-header/em-header.component";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";

@Component({
  standalone: true,
  selector: 'em-cashback-company-edit',
  templateUrl: './cashback-company-edit.component.html',
  styleUrls: ['./cashback-company-edit.component.scss'],
  providers: [
    MerchantService,
    CashbackAccrualTypesServices,
    CashbackRatesService,
    CashbackCompanyService,
    DatePipe
  ],
  imports: [
    ReactiveFormsModule,
    SvgIconComponent,
    NgxPermissionsModule,
    SimpleSelectListComponent,
    ValidatorComponent,
    UploadFieldComponent,
    ToastComponent,
    EmHeaderComponent
  ]
})

export class CashbackCompanyEditComponent extends DestroyableComponent implements OnInit {
  @Input() uploadFile = {
    fileType: '.jpg, .jpeg', memType: 'application/pdf', uploadPath: 'cashback_companies/upload'
  };
  cashbackCompanyId: string;
  companyId: string;
  form: FormGroup;
  cashbackParamJson: FormGroup;
  headerData: IHeader = {
    isFilter: false,
    tabShow: false
  };
  fileStorageUrl: string;
  fileStorageToken: string;
  companyCashback: ISelect[];
  accrualTypes: ISelect[];
  merchants: ISelect[];
  cashbackDetail: ICashbackCompany;
  weekDays: string = 'Пн, Вт, Ср, Чт, Пт, Сб, Вс';
  weeks: Params = {
    monday: 'Пн',
    tuesday: 'Вт',
    wednesday: 'Ср',
    thursday: 'Чт',
    friday: 'Пт',
    saturday: 'Сб',
    sunday: 'Вс',
  }
  isEskhataAcquirer: boolean = false;

  private queryParams: IFilterParams = {
    filters: '',
  };
  private readonly activatedRoute = inject(ActivatedRoute);
  private updateUrl = this.activatedRoute.snapshot.routeConfig.path;
  private canDeactivate$ = new Subject<boolean>();
  private readonly destroyRef = inject(DestroyRef);
  private readonly location = inject(Location);
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(CashbackCompanyService);
  private readonly cashbackService = inject(CashbackRatesService);
  private readonly acrualService = inject(CashbackAccrualTypesServices);
  private readonly merchantService = inject(MerchantService);
  private readonly messageService = inject(MessageService);
  private readonly datePipe = inject(DatePipe);
  private readonly store = inject(HeaderService);
  private readonly dialog = inject(MatDialog);

  get getMerchantsArray(): FormArray {
    return this.form.get('merchants') as FormArray;
  }

  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  get dataWeekKeysArray(): string[] {
    return Object.keys(this.weeks);
  }

  ngOnInit(): void {
    this.initData();
    this.creatForm();
    this.getCompanyCashback();
    this.getAccrualTypes();
    this.getMerchants();
    this.subscribeToCashbackChanges();
    this.subscribeToBankCashbackChanges();
    this.getBankAcquirer();
    if (this.updateUrl !== 'new') {
      this.cashbackCompanyId = this.activatedRoute.snapshot.params['id'];
      this.getDetail();
    }
  }

  onSubmit(): void {
    const value = this.form.value;
    if (!value.bankCashbackId && !value.companyCashbackId) {
      this.messageService.add({severity: ToastEnum.WARN, summary: 'Укажите процент для кэшбэка!'});
      return null;
    }

    if (value.companyCashbackId && (!value.companyStartDate || !value.companyEndDate)) {
      this.messageService.add({severity: ToastEnum.WARN, summary: 'Укажите период для кэшбэка от мерчанта!'});
      return null;
    }

    if (value.bankCashbackId && (!value.bankStartDate || !value.bankEndDate)) {
      this.messageService.add({severity: ToastEnum.WARN, summary: 'Укажите период для кэшбэка от банка!'});
      return null;
    }

    if (value.companyCashbackId && (value.companyStartDate > value.companyEndDate)) {
      this.messageService.add({
        severity: ToastEnum.WARN,
        summary: 'Начальный период не может быть больше конечной для кэшбэка от мерчанта!'
      });
      return null;
    }

    if (value.bankCashbackId && (value.bankStartDate > value.bankEndDate)) {
      this.messageService.add({
        severity: ToastEnum.WARN,
        summary: 'Начальный период не может быть больше конечной для кэшбэка от банка!'
      });
      return null;
    }

    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.messageService.add({severity: ToastEnum.ERROR, summary: 'Неправильно заполнены данные!'});
      return null;
    }

    let $observer: Observable<any>;
    this.form.get('companyId').setValue(this.companyId);

    if (this.updateUrl !== 'new') {
      $observer = this.service.updateCashback({...this.cashbackDetail, ...value});
    } else {
      $observer = this.service.createCashback(value);
    }

    $observer
      .pipe(
        mergeMap(res => {
          this.messageService.add({severity: res.status ? ToastEnum.SUCCESS : ToastEnum.ERROR, summary: res.message});
          return of(res).pipe(delay(res.status ? 2000 : 0))
        }), takeUntil(this.destroyed$)
      )
      .subscribe(
        (res) => {
          if (res.status) {
            this.form.reset();
            this.location.back()
          } else {
            setValidationErrors(this.form, res);
            this.messageService.add({severity: ToastEnum.WARN, summary: res.errors.requestError.length ? res.errors.requestError[0] : res.message })
          }
        }
      );
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
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => this.canDeactivate$.next(res));

    return this.canDeactivate$;
  }

  back(): void {
    this.location.back()
  }

  deactivateFileIds(event: any): void {
    this.form.controls['deletedContractFiles'].patchValue(event);
  }

  getDateTime(): void {
    const cashbackParamJson = DeepClone(this.form.controls['cashbackParamJson'].value);
    const dialogRef = this.dialog.open(DataTimeComponent, {
      disableClose: true,
      data: cashbackParamJson,
      panelClass: 'custom-modalbox'
    });
    dialogRef.afterClosed()
      .pipe(takeUntil(this.destroyed$))
      .subscribe((result: any) => {
        if (result) {
          const selectionWeeks: string[] = [];
          this.form.get('cashbackParamJson').patchValue(result)
          this.dataWeekKeysArray.forEach(day => {
            if (result[day].isActive) {
              selectionWeeks.push(this.weeks[day]);
            }
          })
          this.weekDays = selectionWeeks.toString().replace(/,/g, ', ')
        }
      });
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
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => {
        if (res) {
          this.form.controls[startDate].setValue(res.start.format(DateFormatEnum.YEAR_DATE_LOCAL_FORMAT))
          this.form.controls[endDate].setValue(res.end.format(DateFormatEnum.YEAR_DATE_LOCAL_FORMAT))
          this.form.updateValueAndValidity()
        }
      })
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

  private getBankAcquirer(): void {
    this.store.getBankAcquirer()
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(res => {
          this.isEskhataAcquirer = res;
        });
  }

  private creatForm(): void {
    const createDefaultGroup = (): FormGroup => this.fb.group({
      from: ['00:00:00'],
      to: ['23:59:59'],
      isActive: [true]
    });

    this.cashbackParamJson = this.fb.group({
      monday: createDefaultGroup(),
      tuesday: createDefaultGroup(),
      wednesday: createDefaultGroup(),
      thursday: createDefaultGroup(),
      friday: createDefaultGroup(),
      saturday: createDefaultGroup(),
      sunday: createDefaultGroup()
    });

    this.form = this.fb.group({
      id: [],
      bankCashbackId: [null],
      bankStartDate: [null, Validators.pattern('^(19[0-9]{2}|2[0-9]{3})-(0[1-9]|1[012])-([123]0|[012][1-9]|31)$')],
      bankEndDate: [null, Validators.pattern('^(19[0-9]{2}|2[0-9]{3})-(0[1-9]|1[012])-([123]0|[012][1-9]|31)$')],
      companyStartDate: [null, Validators.pattern('^(19[0-9]{2}|2[0-9]{3})-(0[1-9]|1[012])-([123]0|[012][1-9]|31)$')],
      companyEndDate: [null, Validators.pattern('^(19[0-9]{2}|2[0-9]{3})-(0[1-9]|1[012])-([123]0|[012][1-9]|31)$')],
      companyCashbackId: [null],
      companyId: [this.companyId],
      cashbackAccrualTypeId: ['', Validators.required],
      isActive: [false],
      description: ['', [Validators.maxLength(50)]],
      cashbackParamJson: this.cashbackParamJson,
      merchants: this.fb.array([], [Validators.required]),
      contractFiles: '',
      deletedContractFiles: '',
    })
  }

  private getCompanyCashback(): void {
    this.cashbackService.getCashbackDictionary()
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => this.companyCashback = res.data)
  }

  private getAccrualTypes(): void {
    this.acrualService.getCashbackAccrualDictionary()
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => {
        this.accrualTypes = res.data;
      })
  }

  private getMerchants(): void {
    this.queryParams.filters = `companyId==${this.companyId}`;
    this.merchantService.getMerchantsWithoutPagination(this.queryParams)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => {
        this.merchants = res.data;
      })
  }

  private getDetail(): void {
    this.service.getCashbackCompanyDetail(this.cashbackCompanyId)
      .pipe(
        takeUntil(this.destroyed$)
      )
      .subscribe(res => {
        res.data.bankStartDate = this.datePipe.transform(res.data.bankStartDate, DateFormatEnum.YEAR_DATE_FORMAT);
        res.data.bankEndDate = this.datePipe.transform(res.data.bankEndDate, DateFormatEnum.YEAR_DATE_FORMAT);
        res.data.companyStartDate = this.datePipe.transform(res.data.companyStartDate, DateFormatEnum.YEAR_DATE_FORMAT);
        res.data.companyEndDate = this.datePipe.transform(res.data.companyEndDate, DateFormatEnum.YEAR_DATE_FORMAT);
        this.fileStorageUrl = res.meta.fileStorageUrl;
        this.fileStorageToken = res.meta.fileStorageToken;
        this.cashbackDetail = res.data;
        this.form.patchValue(res.data);

        const cashbackParamJson = DeepClone(this.form.controls['cashbackParamJson'].value);
        const selectionWeeks: string[] = [];
        this.dataWeekKeysArray.forEach(day => {
          if (cashbackParamJson[day].isActive) {
            selectionWeeks.push(this.weeks[day]);
          }
        })
        this.weekDays = selectionWeeks.toString().replace(/,/g, ', ')


        this.cashbackDetail.merchants.forEach(item => {
          const data = this.fb.control('');
          data.setValue(item);
          this.getMerchantsArray.push(data);
        });
        this.merchants?.forEach(item => {
          const check = this.getMerchantsArray.value.find((id: string) => id === item.id);
          if (check) {
            item.isActive = true;
          }
        });
      });
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
      .pipe(takeUntil(this.destroyed$))
      .subscribe(companyId => this.companyId = companyId);
    this.store.setHeader(this.headerData);
  }

  private subscribeToCashbackChanges(): void {
    this.form.get('companyCashbackId')?.valueChanges
      .pipe(takeUntil(this.destroyed$))
      .subscribe(value => {
        if (!value) {
          this.form.controls['companyStartDate'].setValue(null);
          this.form.controls['companyEndDate'].setValue(null);
          this.form.updateValueAndValidity();
        }
      });
  }

  private subscribeToBankCashbackChanges(): void {
    this.form.get('bankCashbackId')?.valueChanges
      .pipe(takeUntil(this.destroyed$))
      .subscribe(value => {
        if (!value) {
          this.form.controls['bankStartDate'].setValue(null);
          this.form.controls['bankEndDate'].setValue(null);
          this.form.updateValueAndValidity();
        }
      });
  }
}
