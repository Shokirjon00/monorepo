import { Component, inject, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize, Observable, of, takeUntil } from 'rxjs';
import { ISelect } from '@eskhata/util';
import { CommonModule, DatePipe, Location } from '@angular/common';
import { BankPromotionService } from '@modules/bank-promotion/services/bank-promotion.service';
import { CashbackAccrualTypesServices } from '@modules/bank-promotion/services/cashback-accrual-types.services';
import { CashbackRatesService } from '@modules/directory/cashback-rates/services/cashback-rates.service';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { IBankPromotion } from '@modules/bank-promotion/interfaces/bank-promotion.interface';
import { CashbackLimitService } from '@modules/directory/cashback-limit/services/cashback-limit.service';
import { MessageService } from '@eskhata/data-access';
import { MatDialog } from '@angular/material/dialog';
import { DataTimeComponent } from '@shared/components/data-time/data-time.component';
import { ToastEnum } from '@eskhata/util';
import { WeekShortEnum } from '@core/enums/week';
import { delay, mergeMap } from 'rxjs/operators';
import { setValidationErrors } from '@core/validators/set-validation-errors';
import { SelectPeriodDialogComponent } from '@shared/dialogs/select-period-dialog/select-period-dialog.component';
import { DeepClone } from '@core/utils/deep-clone';
import { EMBaseForm } from '@core/abstract/base-form.abstract';
import { IParam } from '@eskhata/util';
import { DateFormatEnum } from '@eskhata/util';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { NgxPermissionsModule } from 'ngx-permissions';
import { EmHeaderComponent, SimpleSelectListComponent, ToastComponent, UploadFieldComponent, ValidatorComponent } from '@eskhata/ui';
import { EbLoaderComponent } from '@shared/components/eb-loader/eb-loader.component';
import { CompanyService } from "@modules/client/company/services/company.service";

@Component({
  standalone: true,
  selector: 'em-merchant-services-edit',
  templateUrl: './bank-promotion-edit.component.html',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AngularSvgIconModule,
    NgxPermissionsModule,
    SimpleSelectListComponent,
    ValidatorComponent,
    UploadFieldComponent,
    EbLoaderComponent,
    ToastComponent,
    EmHeaderComponent,
  ],
  styleUrls: ['./bank-promotion-edit.component.scss'],
  providers: [DatePipe, BankPromotionService, CashbackAccrualTypesServices, CompanyService]
})
export class BankPromotionEditComponent extends EMBaseForm implements OnInit {
  @Input() uploadFile = {
    fileType: '.jpg, .jpeg', memType: 'application/pdf', uploadPath: 'cashback_promotion/upload'
  };
  form: FormGroup;
  cashbackParamJson: FormGroup;
  percents: ISelect[];
  accrualTypes: ISelect[];
  cashbackLimit: ISelect[];
  cashbackTypes: ISelect[];
  promotionDetail: IBankPromotion;
  loading: boolean = false;
  weekDays: string = 'Пн, Вт, Ср, Чт, Пт, Сб, Вс';
  forAmount: boolean;
  submitted: boolean = false;
  fileStorageUrl: string;
  fileStorageToken: string;

  weeks: Params = {
    monday: 'Пн',
    tuesday: 'Вт',
    wednesday: 'Ср',
    thursday: 'Чт',
    friday: 'Пт',
    saturday: 'Сб',
    sunday: 'Вс',
  }

  private readonly fb = inject(FormBuilder);
  private readonly service = inject(BankPromotionService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly messageService = inject(MessageService);
  private readonly cashbackService = inject(CashbackRatesService);
  private readonly cashbackLimitService = inject(CashbackLimitService);
  private readonly accrualService = inject(CashbackAccrualTypesServices);
  private readonly datePipe = inject(DatePipe);
  private readonly router = inject(Router);
  private bankPromotionId = this.activatedRoute.snapshot.parent.params['bankPromotionId'];
  private updateUrl = this.activatedRoute.snapshot.routeConfig.path;

  constructor(
    location: Location,
    dialog: MatDialog,
  ) {
    super(location, dialog);
  }

  get dataWeekKeysArray(): string[] {
    return Object.keys(this.weeks);
  }

  @Input() set data(value: IParam) {
    this.dataSource = value;
  }

  ngOnInit(): void {
    this.creatForm();
    this.getPercent();
    this.getAccrualTypes();
    this.getCashbackLimits();
    this.getCashbackTypes();
    if (this.updateUrl !== 'new') {
      this.getDetail(this.bankPromotionId);
    }
  }

  onSubmit(): void {
    const value = this.form.value;
    if (value.bankCashbackId && (!value.bankStartDate || !value.bankEndDate)) {
      this.messageService.add({severity: ToastEnum.WARN, summary: 'Укажите период для кэшбэка от банка!'});
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
    this.submitted = true;
    let $observer: Observable<any>;
    if (this.updateUrl !== 'new') {
      $observer = this.service.updateIBankPromotion({...this.promotionDetail, ...value});
    } else {
      $observer = this.service.createIBankPromotion(value);
    }

    $observer
      .pipe(
        mergeMap(res => {
          this.messageService.add({severity: res.status ? ToastEnum.SUCCESS : ToastEnum.ERROR, summary: res.message});
          return of(res).pipe(delay(res.status ? 2000 : 0))
        }),
        finalize(() => this.submitted = false),
        takeUntil(this.destroyed$))
      .subscribe(
        (res) => {
          if (res.status) {
            this.form.reset();
            this.router.navigate(['bank-promotion']).catch();
          } else {
            setValidationErrors(this.form, res);
            if (res?.errors?.requestError) {
              this.messageService.add({severity: ToastEnum.ERROR, summary: res.errors.requestError});
            }
          }
        }
      );
  }

  onChangedAccrualType(event: ISelect): void {
    const allPaymentId: string = 'e9105749-8c8f-4d20-8402-2fb75b065986';
    if (event) {
      this.forAmount = event.id == allPaymentId
    }
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
          this.weekDays = selectionWeeks.toString().replace(',', ', ')
        }
      });
  }

  getPeriodTime(): void {
    this.dialog.open(SelectPeriodDialogComponent, {
      data: {
        start: this.form.get('bankStartDate').value,
        end: this.form.get('bankEndDate').value,
      },
      disableClose: true,
      panelClass: 'date-picker',
    })
      .afterClosed()
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => {
        if (res) {
          this.form.controls['bankStartDate'].setValue(res.start.format(DateFormatEnum.YEAR_DATE_LOCAL_FORMAT))
          this.form.controls['bankEndDate'].setValue(res.end.format(DateFormatEnum.YEAR_DATE_LOCAL_FORMAT))
          this.form.updateValueAndValidity()
        }
      })
  }

  private getPercent(): void {
    this.cashbackService.getCashbackDictionary()
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => this.percents = res.data)
  }

  private getAccrualTypes(): void {
    this.accrualService.getCashbackAccrualDictionary()
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => this.accrualTypes = res.data)
  }

  private getCashbackLimits(): void {
    this.cashbackLimitService.getCashbackLimitDictionary()
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => this.cashbackLimit = res.data)
  }

  private getCashbackTypes(): void {
    this.service.getBankPromotionTypes()
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => this.cashbackTypes = res.data)
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
      purposeCashbackTypeId: [null, Validators.required],
      bankCashbackId: [null, Validators.required],
      bankStartDate: [null, [Validators.required, Validators.pattern('^(19[0-9]{2}|2[0-9]{3})-(0[1-9]|1[012])-([123]0|[012][1-9]|31)$')]],
      bankEndDate: [null, [Validators.required, Validators.pattern('^(19[0-9]{2}|2[0-9]{3})-(0[1-9]|1[012])-([123]0|[012][1-9]|31)$')]],
      cashbackLimitId: ['', Validators.required],
      cashbackAccrualTypeId: ['', Validators.required],
      description: ['', [Validators.maxLength(50)]],
      isActive: [false, Validators.required],
      cashbackParamJson: this.cashbackParamJson,
      contractFiles: '',
      deletedContractFiles: '',
    })
  }

  private getDetail(bankPromotionId: string): void {
    this.service.getIBankPromotionDetail(bankPromotionId)
      .pipe(
        finalize(() => this.setWeekDays()),
        takeUntil(this.destroyed$))
      .subscribe(res => {
        res.data.bankStartDate = this.datePipe.transform(res.data.bankStartDate, DateFormatEnum.YEAR_DATE_FORMAT);
        res.data.bankEndDate = this.datePipe.transform(res.data.bankEndDate, DateFormatEnum.YEAR_DATE_FORMAT);
        this.promotionDetail = res.data;
        this.fileStorageUrl = res.meta.fileStorageUrl;
        this.fileStorageToken = res.meta.fileStorageToken;
        this.dataSource = res.data;
        this.form.patchValue(res.data);
      });
  }

  private setWeekDays(): void {
    this.weekDays = '';
    const weekMap = new Map(Object.entries(WeekShortEnum));
    for (const key in this.cashbackParamJson.value) {
      const child = this.cashbackParamJson.value[key];
      if ((child.from !== '00:00:00' && child.to !== '00:00:00')
        || (child.from === '00:00:00' && child.to !== '00:00:00')
        || (child.from !== '00:00:00' && child.to === '00:00:00')) {
        this.weekDays += weekMap.get(key) + ', '
      }
    }
  }
}
