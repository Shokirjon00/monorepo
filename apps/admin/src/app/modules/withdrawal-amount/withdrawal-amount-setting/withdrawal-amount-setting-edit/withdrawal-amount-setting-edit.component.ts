import { Component, inject, Input, OnInit } from '@angular/core';
import { DatePipe, Location, NgOptimizedImage } from '@angular/common';
import {
  WithdrawSetService
} from '@modules/withdrawal-amount/withdrawal-amount-setting/services/withdrawal-amount-setting.service';
import { ISelect } from '@core/interfaces/select.interface';
import {
  IMerchants,
  IWithdrawalAmountSettingDetail
} from '@modules/withdrawal-amount/withdrawal-amount-setting/interfaces/withdrawal-amount-setting-detail.interface';
import { finalize, Observable, of, takeUntil } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { IHttpResponse } from '@core/interfaces/http-response.interface';
import { MessageService } from '@core/services/message.service';
import { CompanyService } from '@modules/client/company/services/company.service';
import { MerchantService } from '@modules/client/merchant/services/merchant.service';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { environment as env } from '@environments/environment';
import { IHeader } from '@core/interfaces/header.interface';
import { MatDialog } from '@angular/material/dialog';
import { IFilterParams } from '@core/interfaces/filter-params.interface';
import { delay, mergeMap } from 'rxjs/operators';
import { ToastEnum } from '@core/enums/toast-enum';
import {
  WithdrawalAmountSettingsDialogComponent
} from '@shared/dialogs/withdrawal-amount-settings-dialog/withdrawal-amount-settings-dialog.component';
import { setValidationErrors } from '@core/validators/set-validation-errors';
import { SettingsValidator } from '@core/validators/settings- validator';
import { isGuid } from '@core/utils/is-guid';
import { ErrorService } from '@core/services/error.service';
import { EMBaseForm } from '@core/abstract/base-form.abstract';
import { IParam } from '@core/interfaces/param.interface';
import moment from 'moment';
import { SvgIconComponent } from "angular-svg-icon";
import { NgxPermissionsAllowStubDirective, NgxPermissionsModule } from "ngx-permissions";
import { AutocompleteComponent } from "@shared/components/autocomplete/autocomplete.component";
import { SimpleSelectListComponent } from "@shared/components/simple-select-list/simple-select-list.component";
import { ValidatorComponent } from "@shared/components/validator/validator.component";
import { EbLoaderComponent } from "@shared/components/eb-loader/eb-loader.component";
import { ToastComponent } from "@shared/components/toast/toast.component";
import { EmHeaderComponent } from "@shared/components/em-header/em-header.component";
import { TooltipDirective } from "@core/directives/tooltip.directive";
import {
  IMessage
} from "@modules/withdrawal-amount/withdrawal-amount-setting/withdrawal-amount-setting-edit/interface/message";

enum PeriodId {
  CYCLICAL = '2837d390-3199-4436-bfa2-38fdade78b24'
}

const Period = {
  '2837d390-3199-4436-bfa2-38fdade78b24': {
    text: 'Настройка \'Цикличный период\' означает автоматическое зачисление денег на счёт партнёра каждые 30 минут за операции текущего дня\n',
    icon: './assets/icons/info.svg',
    isVisible: false
  },
  '31eef3e4-cd32-11ec-870b-70b5e85b4283': {
    text: 'Настройка \'Каждый день\' означает автоматическое зачисление денег на счёт партнёра за операции текущего дня в заданное время\n',
    icon: './assets/icons/info.svg',
    isVisible: false
  },
  '49044908-cd32-11ec-870f-70b5e85b4283': {
    text: 'Настройка \'Каждую неделю\' означает автоматическое зачисление денег на счёт партнёра в начале недели за предыдущую (с Пн по Вс).\n',
    icon: './assets/icons/info.svg',
    isVisible: false
  },
  '7e77cf11-303e-4444-8ae0-5cce2a5ea98b': {
    text: 'Настройка \'Каждый месяц\' означает автоматическое зачисление денег на счёт партнёра в начале месяца за предыдущий (с 1 по 31 число).\n',
    icon: './assets/icons/info.svg',
    isVisible: false
  },
};

@Component({
  standalone: true,
  selector: 'em-withdrawal-amount-setting-edit',
  templateUrl: './withdrawal-amount-setting-edit.component.html',
  styleUrls: ['./withdrawal-amount-setting-edit.component.scss'],
  imports: [
    ReactiveFormsModule,
    SvgIconComponent,
    NgxPermissionsAllowStubDirective,
    AutocompleteComponent,
    FormsModule,
    SimpleSelectListComponent,
    ValidatorComponent,
    EbLoaderComponent,
    ToastComponent,
    EmHeaderComponent,
    NgxPermissionsModule,
    NgOptimizedImage,
    TooltipDirective
  ],
  providers: [
    DatePipe,
    MerchantService,
    CompanyService,
    WithdrawSetService
  ]
})
export class WithdrawalAmountSettingEditComponent extends EMBaseForm implements OnInit {
  apiCompaniesPath = `${env.api.companies}/${env.api.dictionary}`;
  companies: ISelect[];
  form: FormGroup;
  isMerchantSame: boolean;
  isTimeSame: boolean = false;
  isTermsSame: boolean = false;
  loading: boolean;
  periodTypes: ISelect[];
  settings: IWithdrawalAmountSettingDetail;
  merchants: ISelect[];
  isNotMerchant: boolean;
  showFinishAt: boolean;
  headerData: IHeader = {
    isFilter: false,
    tabShow: false
  };
  submitted: boolean = false;
  companyFilter = {eskhataAcquirer: 'Да', MerchantsStatus: 'true'};
  protected readonly period: IMessage = Period;
  private queryParams: IFilterParams = {
    filters: '',
  };
  private readonly errorService = inject(ErrorService);
  public readonly datepipe = inject(DatePipe);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly messageService = inject(MessageService);
  private readonly service = inject(WithdrawSetService);
  private readonly companyService = inject(CompanyService);
  private readonly merchantService = inject(MerchantService);
  private readonly fb = inject(FormBuilder);
  updateUrl = this.activatedRoute.snapshot.routeConfig.path;
  id = this.activatedRoute.snapshot.params['id'];
  constructor(
    location: Location,
    dialog: MatDialog,
  ) {
    super(location, dialog);
    this.createForm();
  }

  get merchantsFormArray(): FormArray {
    return this.form.get('merchants') as FormArray;
  }

  get merchantsFormControlsArray(): FormGroup[] {
    return this.merchantsFormArray.controls as FormGroup[];
  }

  @Input() set data(value: IParam) {
    this.dataSource = value;
  }

  ngOnInit(): void {
    this.getPeriodTypes();
    if (this.updateUrl !== 'new') {
      this.getSettingDetail();
    } else {
      this.getCompanyDictionary();
    }
  }

  onSubmit(): void {
    this.loading = true;
    this.merchantsFormControlsArray.forEach((c) => c.markAllAsTouched())
    if (this.form.invalid
    ) {
      this.messageService.add({severity: ToastEnum.ERROR, summary: 'Неправильно заполнены данные!'});
      return null;
    }
    this.submitted = true;
    const clonedArray = [...this.form.controls['merchants'].value];
    const merchants = clonedArray.filter(item => item.isActive);
    const body = {
      id: this.form.get('id').value,
      companyId: this.form.get('companyId').value,
      merchants: merchants,
      isActive: this.form.get('isActive').value,
      canManuallyIssue: this.form.get('canManuallyIssue').value
    }
    let $observer: Observable<IHttpResponse<IWithdrawalAmountSettingDetail>>;
    if (this.updateUrl !== 'new') {
      $observer = this.service.update(body);
    } else {
      $observer = this.service.create(body);
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
      .subscribe((res) => {
        if (res.status) {
          this.form.reset();
          this.back();
        } else {
          setValidationErrors(this.form, res);
          if (res.errors.merchants || res.errors.companyId) {
            this.messageService.add({
              severity: ToastEnum.WARN,
              summary: res.errors.merchants || res.errors.companyId
            });
          }
          if (res.errors?.['requestError']?.[0]) {
            this.errorService.showAlert({
              title: res.errors['requestError'][0],
            }, '35vw');
          }
        }
      });
  }

  selectedCompany(companyId: string): void {
    if (isGuid(companyId) && this.updateUrl === 'new') {
      this.getMerchants(companyId);
    } else if (!companyId && this.updateUrl === 'new') {
      this.merchantsFormArray.clear();
    }
  }

  chooseAllMerchants(): void {
    this.settings?.merchants.forEach((item, index) => {
      const control = this.merchantsFormArray.at(index);
      control.get('isActive').setValue(this.isMerchantSame);
      if (control.get('isActive').value && !control.get('runAt').value) {
        this.isTimeSame = false;
      }
      if (control.get('isActive').value && !control.get('issueMoneyPeriodTypeId').value) {
        this.isTermsSame = false;
      }
    });
  }

  chooseMerchant(merchant: AbstractControl): void {
    this.isMerchantSame = true;
    this.merchantsFormArray.value.forEach((item: IMerchants) => {
      if (item.isActive !== merchant.value.isActive || !merchant.value.isActive) {
        return this.isMerchantSame = false;
      }
    });
  }

  chooseAllMerchantTimes(): void {
    if (!this.isTimeSame) return;
    this.sameTimeDialog('')
      .pipe(takeUntil(this.destroyed$))
      .subscribe(timeId => {
          this.isTimeSame = timeId;
          if (timeId) {
            this.setCustomValue(this.merchantsFormArray.controls, 'runAt', timeId);
          }
        }
      );
  }

  chooseMerchantTime(merchant: AbstractControl): void {
    this.isTimeSame = true;
    this.merchantsFormArray.value.forEach((item: IMerchants) => {
      if ((!item.runAt || item.runAt !== merchant.value.runAt) && item.isActive) {
        return this.isTimeSame = false;
      }
    })
  }

  chooseAllMerchantTerms(): void {
    if (!this.isTermsSame) return;
    this.sameTimeDialog(this.periodTypes)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(termId => {
        this.isTermsSame = termId;
        if (termId) {
          this.setCustomValue(this.merchantsFormArray.controls, 'issueMoneyPeriodTypeId', termId);
        }
      })
  }

  chooseMerchantTerm(evt: ISelect, merchant: AbstractControl): void {
    this.isTermsSame = true;
    this.showFinishAt = evt && evt.id === '2837d390-3199-4436-bfa2-38fdade78b24';
    this.merchantsFormArray.value.forEach((item: IMerchants) => {
      if (item.merchantId === merchant.value.merchantId) {
        item.issueMoneyPeriodTypeId = evt ? evt.id : null;
      }
      if ((!item.issueMoneyPeriodTypeId || item.issueMoneyPeriodTypeId !== evt?.id) && item.isActive) {
        this.isTermsSame = false;
      }
    });
  }

  private sameTimeDialog(value: any): Observable<any> {
    return this.dialog.open(WithdrawalAmountSettingsDialogComponent, {
      data: value,
      width: '400px',
      panelClass: 'custom-modalbox',
    })
      .afterClosed()
      .pipe(takeUntil(this.destroyed$));
  }

  private getPeriodTypes(): void {
    this.service.getPeriodTypes()
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => this.periodTypes = res.data);
  }

  private getSettingDetail(): void {
    this.service.getForUpdate(this.id)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => {
        if (res.status) {
          this.settings = res.data;
          this.dataSource = res.data;
          this.form.patchValue(res.data);
          res.data.merchants.forEach(item => {
            item.issueMoneyPeriodTypeId = item.issueMoneyPeriodTypeId || '';
            item.isActive = item.isActive || false;
            item.runAt = moment(item.runAt, 'HH:mm:ss').format('HH:mm:ss');
            item.finishAt = item.finishAt == null ? null : moment(item.finishAt, 'HH:mm:ss').format('HH:mm:ss');
            item.merchantId = item.merchantId || '';
            const formGroup = this.newMerchant();
            formGroup.setValue(item);
            this.merchantsFormArray.push(formGroup);
            this.isMerchantSame = true;
            if (item.isActive !== res.data.merchants[0].isActive) {
              this.isMerchantSame = false;
              return;
            }
            this.isMerchantSame = item.isActive;
          });
          this.compareSelectedMerchants(res.data.merchants);
        }
      });
  }

  private getMerchants(companyId: string): void {
    this.merchantsFormArray.clear();
    this.queryParams.filters = `companyId==${companyId}`;
    this.merchantService.getMerchantsWithoutPagination(this.queryParams)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => {
        if (res.status) {
          this.isNotMerchant = false;
          res.data.forEach((item: ISelect) => {
            const formGroup = this.newMerchant();
            formGroup.setValue({
              merchantId: item.id,
              name: item.name,
              issueMoneyPeriodTypeId: '',
              runAt: '',
              finishAt: '',
              isActive: false,
            });
            this.merchantsFormArray.push(formGroup);
          });
          if (!res.data.length) {
            this.isNotMerchant = true;
          }
        }
        this.settings = this.form.value;
      })
  }

  private getCompanyDictionary(): void {
    this.companyService.getCompanyDictionary()
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => this.companies = res.data);
  }

  private createForm(): void {
    this.form = this.fb.group({
      id: [''],
      companyId: ['', [Validators.required]],
      merchants: this.fb.array([]),
      isActive: [false],
      canManuallyIssue: [false]
    });
  }

  private newMerchant(): FormGroup {
    return new FormGroup({
      merchantId: new FormControl('', [Validators.required]),
      name: new FormControl(''),
      issueMoneyPeriodTypeId: new FormControl(''),
      runAt: new FormControl(''),
      finishAt: new FormControl(''),
      isActive: new FormControl(false)
    }, [SettingsValidator.validate()]);
  }

  private compareSelectedMerchants(merchants: IMerchants[]): void {
    const selectedMerchants = merchants.filter(merchant => merchant.isActive);
    this.isTimeSame = selectedMerchants.every((item: IMerchants) => item.runAt === selectedMerchants[0].runAt);
    this.isTermsSame = selectedMerchants.every((item: IMerchants) => item.issueMoneyPeriodTypeId === selectedMerchants[0].issueMoneyPeriodTypeId);
  }

  private setCustomValue(merchants: AbstractControl[], field: string, value: string): void {
    for (const merchant of merchants) {
      if (merchant.get('isActive')?.value) {
        merchant.get(field).setValue(value);
      }
    }
  }

  protected readonly Period = Period;
  protected readonly PeriodId = PeriodId;
}
